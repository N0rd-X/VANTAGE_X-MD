'use strict';

const crypto   = require('crypto');
const axios    = require('axios');
const FormData = require('form-data');
const { downloadMediaMessage } = require('@whiskeysockets/baileys');

const { readDb, writeDb }  = require('../lib/db');
const { getGroupContext }  = require('../helpers');

const FILE        = 'antinsfw.json';
const API_BASE    = process.env.NSFW_API_BASE || 'https://nsfw-categorize.it/api';
const API_TIMEOUT = 15_000;
const MAX_BYTES   = 8 * 1024 * 1024;           // skip huge images

// Skin-ratio thresholds for the local pre-filter (0..1 of sampled pixels).
const SKIP_BELOW      = parseFloat(process.env.NSFW_SKIP_BELOW)  || 0.20;  // definitely fine
const FALLBACK_ABOVE  = parseFloat(process.env.NSFW_LOCAL_BLOCK) || 0.60;  // block without API

let apiBlockedUntil = 0;                        // set when the free quota runs out

// ── Per-group switch ─────────────────────────────────────────────────────────

const isEnabled = (jid) => !!readDb(FILE, {})[jid];

function setEnabled(jid, on) {
    const all = { ...readDb(FILE, {}) };
    if (on) all[jid] = true; else delete all[jid];
    writeDb(FILE, all);
}

// ── Local skin-tone estimate ─────────────────────────────────────────────────

async function skinRatio(buffer) {
    let sharp;
    try { sharp = require('sharp'); } catch { return null; }

    const { data, info } = await sharp(buffer, { failOn: 'none' })
        .rotate()
        .resize(96, 96, { fit: 'inside' })
        .removeAlpha()
        .raw()
        .toBuffer({ resolveWithObject: true });

    let skin = 0;
    const total = info.width * info.height;
    for (let i = 0; i < data.length; i += info.channels) {
        const r = data[i], g = data[i + 1], b = data[i + 2];
        // YCbCr skin range plus a simple RGB sanity check
        const cb = 128 - 0.168736 * r - 0.331264 * g + 0.5 * b;
        const cr = 128 + 0.5 * r - 0.418688 * g - 0.081312 * b;
        if (cb >= 77 && cb <= 127 && cr >= 133 && cr <= 173 && r > 95 && g > 40 && b > 20 && r > g && r > b) skin++;
    }
    return total ? skin / total : 0;
}

// ── Free API ─────────────────────────────────────────────────────────────────

// Returns true (nsfw), false (clean) or null (unknown / no quota).
async function apiVerdict(buffer) {
    if (Date.now() < apiBlockedUntil) return null;

    const verdict = (res) => {
        const body = res?.data;
        if (body?.status === 'NOQUOTA') { apiBlockedUntil = Date.now() + 60 * 60 * 1000; return null; }
        if (body?.status !== 'OK' || !body.data) return null;
        return !!(body.data.nsfw || body.data.porn);
    };

    let upload = buffer;
    try {
        upload = await require('sharp')(buffer, { failOn: 'none' })
            .rotate().resize(400, 400, { fit: 'inside' }).jpeg({ quality: 80 }).toBuffer();
    } catch { /* send the original */ }

    // 1. Hash lookup, costs no quota
    try {
        const hash = crypto.createHash('sha1').update(upload).digest('hex');
        const known = verdict(await axios.get(`${API_BASE}/hash/${hash}`, { timeout: API_TIMEOUT, validateStatus: () => true }));
        if (known !== null) return known;
    } catch { /* fall through to upload */ }

    // 2. Upload
    try {
        const form = new FormData();
        form.append('image', upload, { filename: 'image.jpg', contentType: 'image/jpeg' });
        return verdict(await axios.post(`${API_BASE}/upload`, form, {
            headers: form.getHeaders(), timeout: API_TIMEOUT, maxBodyLength: Infinity, validateStatus: () => true,
        }));
    } catch {
        return null;
    }
}

async function isNsfw(buffer) {
    let ratio = null;
    try { ratio = await skinRatio(buffer); } catch { /* sharp failure: let the API decide */ }

    if (ratio !== null && ratio < SKIP_BELOW) return false;

    const api = await apiVerdict(buffer);
    if (api !== null) return api;

    return ratio !== null && ratio >= FALLBACK_ABOVE;
}

// ── Message hook ─────────────────────────────────────────────────────────────

async function check(sock, rawMsg, { jid, ownerFlag } = {}) {
    if (ownerFlag || !jid?.endsWith('@g.us') || !isEnabled(jid)) return false;
    if (!rawMsg?.message?.imageMessage) return false;

    const size = Number(rawMsg.message.imageMessage.fileLength || 0);
    if (size > MAX_BYTES) return false;

    try {
        const ctx = await getGroupContext(sock, rawMsg);
        if (ctx?.senderIsAdmin) return false;

        const buffer = await downloadMediaMessage(rawMsg, 'buffer', {});
        if (!buffer?.length || buffer.length > MAX_BYTES) return false;
        if (!(await isNsfw(buffer))) return false;

        const sender = rawMsg.key.participant || rawMsg.key.participantPn;
        await sock.sendMessage(jid, { delete: rawMsg.key });
        await sock.sendMessage(jid, {
            text:     `🔞 @${String(sender || '').split('@')[0]}, explicit images aren't allowed here.`,
            mentions: sender ? [sender] : [],
        });
        return true;
    } catch (err) {
        console.error('[antinsfw]', err.message);
        return false;
    }
}

module.exports = { check, isEnabled, setEnabled, isNsfw };
