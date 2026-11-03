'use strict';

// Shared media-conversion helper for the converter commands.

const fs     = require('fs').promises;
const fsSync = require('fs');
const os     = require('os');
const path   = require('path');
const crypto = require('crypto');
const { execFile }  = require('child_process');
const { promisify } = require('util');
const { downloadMediaMessage } = require('@whiskeysockets/baileys');

const execFileAsync = promisify(execFile);

// ── Config ───────────────────────────────────────────────────────────────────

const FFMPEG = (() => {
    try { return require('ffmpeg-static') || 'ffmpeg'; } catch { return 'ffmpeg'; }
})();

const TIMEOUT_MS = 120_000;   // kill ffmpeg after 2 minutes
const MAX_MB     = 150;        // largest input we'll convert(in MB)

// drawtext needs a font file when ffmpeg has no fontconfig (true for most static builds)
const FONT_FILE = [
    '/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf',
    '/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf',
    '/usr/share/fonts/dejavu/DejaVuSans.ttf',
    '/system/fonts/Roboto-Regular.ttf',            // Android / Termux
].find(p => p && fsSync.existsSync(p)) || null;

// ── Temp files ───────────────────────────────────────────────────────────────

// "vx_<timestamp>" matches the janitor in lib/safety.js, so crashed runs get swept too.
function tmpPath(ext) {
    return path.join(os.tmpdir(), `vx_${Date.now()}_${crypto.randomBytes(3).toString('hex')}.${ext}`);
}

// ── ffmpeg ───────────────────────────────────────────────────────────────────

// Run ffmpeg with an argument array. Rejects on non-zero exit or timeout.
function runFfmpeg(args) {
    return execFileAsync(FFMPEG, ['-y', '-hide_banner', '-loglevel', 'error', ...args], {
        timeout:    TIMEOUT_MS,
        maxBuffer:  16 * 1024 * 1024,
        killSignal: 'SIGKILL',
    });
}

// ── Quoted media ─────────────────────────────────────────────────────────────

function getQuoted(msg) {
    const m   = msg.message || {};
    const ctx = m.extendedTextMessage?.contextInfo
            || m.imageMessage?.contextInfo
            || m.videoMessage?.contextInfo;
    if (!ctx?.quotedMessage) return null;

    return {
        quoted: ctx.quotedMessage,
        quotedMsg: {
            key: {
                remoteJid:   msg.key.remoteJid,
                id:          ctx.stanzaId,
                participant: ctx.participant,
            },
            message: ctx.quotedMessage,
        },
    };
}

// ── The converter pipeline ───────────────────────────────────────────────────

async function convertQuoted(sock, msg, o) {
    const jid = msg.key.remoteJid;

    const q = getQuoted(msg);
    if (!q || !o.accepts.some(k => q.quoted[k])) {
        return sock.sendMessage(jid, { text: o.notFound });
    }

    const wait   = await sock.sendMessage(jid, { text: o.waiting });
    const input  = tmpPath(o.inExt);
    const output = tmpPath(o.outExt);
    const extras = [];
    const tmpFile = (ext) => { const p = tmpPath(ext); extras.push(p); return p; };

    try {
        const buffer = await downloadMediaMessage(q.quotedMsg, 'buffer', {});
        if (buffer.length > MAX_MB * 1024 * 1024) {
            const err = new Error(`input larger than ${MAX_MB} MB`);
            err.userMessage = `❌ That file is too large (max ${MAX_MB} MB).`;
            throw err;
        }

        await fs.writeFile(input, buffer);

        const ctx = { input, output, tmpFile };
        if (o.run) {
            await o.run(ctx);
        } else {
            const opts = typeof o.args === 'function' ? await o.args(ctx) : (o.args || []);
            await runFfmpeg(['-i', input, ...opts, output]);
        }

        const result = await fs.readFile(output);
        if (!o.keepWait) await sock.sendMessage(jid, { delete: wait.key }).catch(() => {});
        await sock.sendMessage(jid, o.reply(result));
    } catch (err) {
        console.error(`[${o.label || 'convert'}]`, err.message);
        await sock.sendMessage(jid, {
            text: err.userMessage || o.errorText || '❌ Failed. Is ffmpeg installed?',
        }).catch(() => {});
    } finally {
        // Always clean up — the old per-command code leaked these files whenever ffmpeg failed.
        await Promise.all([input, output, ...extras].map(f => fs.unlink(f).catch(() => {})));
    }
}

module.exports = { FFMPEG, FONT_FILE, tmpPath, runFfmpeg, getQuoted, convertQuoted };
