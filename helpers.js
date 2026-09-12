'use strict';

const fs     = require('fs');
const path   = require('path');
const config = require('./config');
const { jidDecode, jidNormalizedUser, proto, getContentType } = require('@whiskeysockets/baileys');

const DB_DIR = path.join(__dirname, 'database');

// ─── JID utilities ────────────────────────────────────────────────────────────

function _decodeJid(jid) {
    if (!jid) return jid;
    if (/:\d+@/gi.test(jid)) {
        const decoded = jidDecode(jid) || {};
        return decoded.user && decoded.server ? `${decoded.user}@${decoded.server}` : jid;
    }
    return jidNormalizedUser(jid);
}

// ─── Group utilities ──────────────────────────────────────────────────────────

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

function getTarget(msg, args) {
    const ctx = msg.message?.extendedTextMessage?.contextInfo;
    if (ctx?.mentionedJid?.[0]) return ctx.mentionedJid[0];
    if (ctx?.participant)        return ctx.participant;
    const num = args[0]?.replace(/\D/g, '');
    if (num) return `${num}@s.whatsapp.net`;
    return null;
}

// ─── Message utilities ────────────────────────────────────────────────────────

function send(sock, jid, text, extra = {}) {
    return sock.sendMessage(jid, { text, ...extra });
}

// ─── Owner utilities ──────────────────────────────────────────────────────────

async function ownerGuard(sock, msg) {
    const jid    = msg.key.remoteJid;
    const fromMe = msg.key.fromMe;

    // fromMe = the bot's own device is unconditionally trusted
    if (fromMe) return false;

    const sender = _decodeJid(msg.key.participant || msg.key.remoteJid);

    const { isOwner } = require('./services/commands');
    if (!isOwner(sender)) {
        console.warn(`[AUTH] ownerGuard blocked — sender: ${sender}`);
        await send(sock, jid, global.mess?.owner ?? '⛔ Owner only.');
        return true;   // blocked
    }
    return false;      // allowed
}

// ─── Database factory ─────────────────────────────────────────────────────────

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

function tooLarge(buffer, maxMB = 50) {
    return buffer.length > maxMB * 1024 * 1024;
}

// ─── Message serialiser (migrated from lib/myfunc.js) ────────────────────────

function getCleanParticipantId(conn, m) {
    const isGroup = m?.chat?.endsWith('@g.us');
    let jid = m?.key?.participantPn;
    if (!jid && isGroup) jid = conn.user?.id;
    if (jid?.includes(':')) jid = jid.split(':')[0] + '@s.whatsapp.net';
    return jid;
}

/**
 * Attach convenience properties to a raw Baileys message object.
 * @param {object} conn  - Baileys socket
 * @param {object} m     - Raw message from messages.upsert
 * @returns {object}     The same message, mutated with helper fields
 */
function smsg(conn, m) {
    if (!m) return m;
    const M = proto.WebMessageInfo;

    if (m.key) {
        m.id       = m.key.id;
        m.isBaileys = m.id?.startsWith('BAE5') && m.id.length === 16;
        m.chat     = m.key.remoteJid;
        m.fromMe   = m.key.fromMe;
        m.isGroup  = m.chat?.endsWith('@g.us');
        m.cleanParticipantId = getCleanParticipantId(conn, m);
        m.sender   = conn.decodeJid(
            (m.fromMe && conn.user.id) ||
            m.cleanParticipantId       ||
            m.key.senderPn             ||
            m.key.participant          ||
            m.participant              ||
            m.chat                     ||
            ''
        );
        if (m.isGroup) m.participant = conn.decodeJid(m.key.participant) || '';
    }

    if (m.message) {
        m.mtype = getContentType(m.message);
        m.msg   = m.mtype === 'viewOnceMessage'
            ? m.message[m.mtype].message[getContentType(m.message[m.mtype].message)]
            : m.message[m.mtype];

        m.body  =
            m.message.conversation                                       ||
            m.msg?.caption                                               ||
            m.msg?.text                                                  ||
            (m.mtype === 'listResponseMessage'   && m.msg?.singleSelectReply?.selectedRowId) ||
            (m.mtype === 'buttonsResponseMessage' && m.msg?.selectedButtonId)                ||
            (m.mtype === 'viewOnceMessage'        && m.msg?.caption)                         ||
            m.text                                                       ||
            '';

        const quoted = m.quoted = m.msg?.contextInfo?.quotedMessage ?? null;
        m.mentionedJid = m.msg?.contextInfo?.mentionedJid ?? [];

        if (m.quoted) {
            const type  = getContentType(quoted);
            m.quoted    = m.quoted[type];
            if (!m.quoted || typeof m.quoted === 'string') m.quoted = { text: m.quoted };
            m.quoted.mtype   = type;
            m.quoted.id      = m.msg.contextInfo.stanzaId;
            m.quoted.chat    = m.msg.contextInfo.remoteJid || m.chat;
            m.quoted.isBaileys = m.quoted.id?.startsWith('BAE5') && m.quoted.id.length === 16;
            m.quoted.sender  = conn.decodeJid(m.msg.contextInfo.participant);
            m.quoted.fromMe  = m.quoted.sender === conn.user?.id;
            m.quoted.text    =
                m.quoted.text            ||
                m.quoted.caption         ||
                m.quoted.conversation    ||
                m.quoted.contentText     ||
                m.quoted.selectedDisplayText ||
                m.quoted.title           ||
                '';
            m.quoted.mentionedJid = m.msg.contextInfo?.mentionedJid ?? [];
        }
    }

    if (m.msg?.url) m.download = () => conn.downloadMediaMessage(m.msg);
    m.text =
        m.msg?.text            ||
        m.msg?.caption         ||
        m.message?.conversation ||
        m.msg?.contentText     ||
        m.msg?.selectedDisplayText ||
        m.msg?.title           ||
        '';

    return m;
}

module.exports = {
    getGroupContext, getTarget, send, ownerGuard, makeDB,
    getQuotedImage, getQuotedMedia, tooLarge, smsg,
};
