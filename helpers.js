'use strict';

const fs     = require('fs');
const path   = require('path');
const config = require('./config');
const { jidDecode, jidNormalizedUser, proto, getContentType, normalizeMessageContent } = require('@whiskeysockets/baileys');

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

// WhatsApp identifies the same person in several ways: a phone JID, a LID, each with a ":device" suffix.
// Everything below compares identities as *sets* of bare JIDs, so a phone-JID sender still matches a LID participant.

const _bare = (jid) => {
    if (typeof jid !== 'string' || !jid.includes('@')) return null;
    const [user, server] = jid.toLowerCase().split('@');
    return `${user.split(':')[0]}@${server === 'c.us' ? 's.whatsapp.net' : server}`;
};
const _idSet  = (...ids) => new Set(ids.flat().map(_bare).filter(Boolean));
const _shares = (a, b) => { for (const x of a) if (b.has(x)) return true; return false; };

// Build the authorisation context for a message sent in a group.
async function getGroupContext(sock, msg) {
    const key = msg.key;
    const jid = key.remoteJid;
    if (!jid || !jid.endsWith('@g.us')) return null;

    const meta   = await sock.groupMetadata(jid);
    const fromMe = !!key.fromMe;

    const botIds    = _idSet(sock.user?.id, sock.user?.lid);
    const senderIds = fromMe
        ? botIds
        : _idSet(key.participant, key.participantPn, key.participantLid, key.senderPn, key.senderLid);

    const entryIds = (p) => _idSet(p?.id, p?.jid, p?.lid, p?.phoneNumber);
    const findBy   = (ids) => meta.participants.find(p => _shares(entryIds(p), ids)) || null;
    const expand   = (id) => new Set([..._idSet(id), ...entryIds(findBy(_idSet(id)))]);

    const senderEntry = findBy(senderIds);
    const botEntry    = findBy(botIds);

    // Lazy require: services/commands pulls in config + db, keep helpers import-cycle free.
    const { isOwner } = require('./services/commands');
    const ownerCheck  = (ids) => isOwner([...ids]);

    const senderIsOwner = fromMe || ownerCheck(new Set([...senderIds, ...entryIds(senderEntry)]));
    const isBot         = (id) => _shares(expand(id), botIds);
    const isOwnerJid    = (id) => ownerCheck(expand(id));

    return {
        jid,
        meta,
        sender: key.participant || key.participantPn || (fromMe ? _bare(sock.user?.id) : jid),
        botId:  _bare(sock.user?.id),
        participants: meta.participants.map(p => p.id),

        senderIsOwner,
        senderIsAdmin: !!senderEntry?.admin || senderIsOwner,
        botIsAdmin:    !!botEntry?.admin,

        participantFor: (id) => findBy(_idSet(id)),
        isBot,
        isOwnerJid,

        // { ok:true } or { ok:false, reason:'bot'|'owner' } — the owner may do anything to anyone
        // except the bot itself; everybody else may not act against the bot or the owner.
        canTarget(id) {
            if (isBot(id)) return { ok: false, reason: 'bot' };
            if (!senderIsOwner && isOwnerJid(id)) return { ok: false, reason: 'owner' };
            return { ok: true };
        },
    };
}

// Gate for group commands.
async function requireGroup(sock, msg, { admin = false, botAdmin = false } = {}) {
    const jid   = msg.key.remoteJid;
    const reply = (text) => sock.sendMessage(jid, { text }).catch(() => {});

    if (!jid || !jid.endsWith('@g.us')) { await reply(global.mess.group); return null; }

    const ctx = await getGroupContext(sock, msg);
    if (admin    && !ctx.senderIsAdmin) { await reply(global.mess.admin);    return null; }
    if (botAdmin && !ctx.botIsAdmin)    { await reply(global.mess.botAdmin); return null; }
    return ctx;
}

// Raw text exactly as typed. This keeps newlines and repeated spaces, which matters for multi-line messages.
function rawArgs(msg) {
    const c    = normalizeMessageContent(msg.message) || {};
    const text = c.conversation || c.extendedTextMessage?.text || c.imageMessage?.caption || c.videoMessage?.caption || '';
    return text.replace(/^\s*\S+/, '').trim();
}

// Raw target JID from a mention, else from a phone number argument. null when neither is present.
function pickTarget(msg, args) {
    const mentioned = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0];
    if (mentioned) return mentioned;
    const digits = String(args?.[0] || '').replace(/\D/g, '');
    return digits ? `${digits}@s.whatsapp.net` : null;
}

const DENY_TARGET = {
    bot:   "❌ I can't target myself.",
    owner: "⛔ I'm not allowed to target my owner.",
};

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
    getGroupContext, requireGroup, pickTarget, rawArgs, DENY_TARGET, getTarget, send, makeDB,
    getQuotedImage, getQuotedMedia, tooLarge, smsg,
};
