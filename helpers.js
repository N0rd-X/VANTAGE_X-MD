'use strict';

const fs     = require('fs');
const path   = require('path');
const config = require('./config');

const DB_DIR = path.join(__dirname, 'database');

// ─── Group utilities ──────────────────────────────────────────────────────────

/**
 * Fetch group metadata and derive a permission context object.
 */
async function getGroupContext(sock, msg) {
    const jid = msg.key.remoteJid;
    if (!jid.endsWith('@g.us')) return null;

    const meta   = await sock.groupMetadata(jid);
    const sender = msg.key.participant || msg.key.remoteJid;
    const botId  = sock.user.id.replace(/:\d+/, '') + '@s.whatsapp.net';
    const find   = (id) => meta.participants.find(p => p.id === id);

    return {
        jid,
        meta,
        sender,
        botId,
        senderIsAdmin: !!find(sender)?.admin,
        botIsAdmin:    !!find(botId)?.admin,
        participants:  meta.participants.map(p => p.id),
    };
}

/**
 * Resolve a target JID in priority order
 */
function getTarget(msg, args) {
    const ctx = msg.message?.extendedTextMessage?.contextInfo;
    if (ctx?.mentionedJid?.[0]) return ctx.mentionedJid[0];
    if (ctx?.participant)        return ctx.participant;
    const num = args[0]?.replace(/\D/g, '');
    if (num) return `${num}@s.whatsapp.net`;
    return null;
}

// ─── Message utilities ────────────────────────────────────────────────────────

/** Thin wrapper so callers don't repeat { text } every time. */
function send(sock, jid, text, extra = {}) {
    return sock.sendMessage(jid, { text, ...extra });
}

// ─── Owner utilities ──────────────────────────────────────────────────────────

/**
 * Check if the sender is the bot owner
 */
async function ownerGuard(sock, msg) {
    const jid    = msg.key.remoteJid;
    const sender = msg.key.participant || msg.key.remoteJid;
    if (sender !== `${config.ownernumber}@s.whatsapp.net`) {
        await send(sock, jid, global.mess?.owner ?? '⛔ Owner only.');
        return true;
    }
    return false;
}

// ─── Database factory ─────────────────────────────────────────────────────────

/**
 * Create a simple JSON-file-backed store.
 * @param {string} filename  DB file name (without .json)
 * @param {object} defaults  Returned when the file doesn't exist yet
 * @returns {{ load: () => object, save: (data: object) => void }}
 */
function makeDB(filename, defaults = {}) {
    if (!fs.existsSync(DB_DIR)) fs.mkdirSync(DB_DIR, { recursive: true });
    const fpath = path.join(DB_DIR, `${filename}.json`);
    return {
        load: () => {
            try { return JSON.parse(fs.readFileSync(fpath, 'utf8')); }
            catch { return { ...defaults }; }
        },
        save: (d) => fs.writeFileSync(fpath, JSON.stringify(d, null, 2)),
    };
}

// ─── Media utilities ─────────────────────────────────────────────────────────

/**
 * Extract the quoted/replied-to image from a message.
 */
function getQuotedImage(msg) {
    const ctx = msg.message?.extendedTextMessage?.contextInfo;
    if (!ctx?.quotedMessage?.imageMessage) return null;
    return {
        contextInfo: ctx,
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

/**
 * Extract any quoted/replied-to media from a messages
 */
function getQuotedMedia(msg) {
    const ctx = msg.message?.extendedTextMessage?.contextInfo;
    if (!ctx?.quotedMessage) return null;

    const MEDIA_KEYS = ['imageMessage', 'videoMessage', 'audioMessage', 'stickerMessage', 'documentMessage'];
    const key = MEDIA_KEYS.find(k => ctx.quotedMessage[k]);
    if (!key) return null;

    return {
        type: key.replace('Message', ''),
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

/** True if a downloaded buffer exceeds maxMB (default 50MB). */
function tooLarge(buffer, maxMB = 50) {
    return buffer.length > maxMB * 1024 * 1024;
}

module.exports = {
    getGroupContext, getTarget, send, ownerGuard, makeDB,
    getQuotedImage, getQuotedMedia, tooLarge,
};
