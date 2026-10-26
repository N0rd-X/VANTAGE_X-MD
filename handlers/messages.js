'use strict';

const { smsg }   = require('../helpers');
const { readDb } = require('../lib/db');
const { isOwner, learnOwnerLid, getMode, modeAllows, run: runCommand } = require('../services/commands');
const chatbot     = require('../services/chatbot');
const antilink    = require('../services/antilink');
const auto        = require('./auto');
const { handleOwnerProtection } = require('./ownerMentions');
const VantageMenu = require('../menu');
const lidToPn = new Map();

// Work out who really sent the message. WhatsApp may identify people by LID
function resolveSender(sock, key, chatJid, fromMe) {
    if (fromMe) return sock.decodeJid(sock.user.id);

    let raw = key.participant
        ? (key.participantPn || key.participant)
        : (key.senderPn      || chatJid);

    if (typeof raw === 'string' && raw.endsWith('@lid') && lidToPn.has(raw)) raw = lidToPn.get(raw);
    return sock.decodeJid(raw);
}

function attach(sock, cmdRef) {
    sock.ev.on('chats.phoneNumberShare', ({ lid, jid }) => {
        if (lid && jid) lidToPn.set(lid, jid);
    });

    sock.ev.on('messages.upsert', async ({ messages, type }) => {
        if (process.env.DEBUG_MSGS === 'true') {
            console.log(`[DEBUG] upsert type=${type} count=${messages.length}`);
        }
        if (type !== 'notify') return;

        const rawMsg = messages[0];
        if (!rawMsg?.message) return;

        if (Object.keys(rawMsg.message)[0] === 'ephemeralMessage') {
            rawMsg.message = rawMsg.message.ephemeralMessage.message;
        }

        if (rawMsg.key.id?.startsWith('BAE5') && rawMsg.key.id.length === 16) return;

        // ── 1. Parse & normalise ──────────────────────────────────────────────

        const m       = smsg(sock, rawMsg, {});
        const jid     = m.key.remoteJid;
        if (!jid) return;

        const fromMe    = m.key.fromMe;
        const sender    = resolveSender(sock, m.key, jid, fromMe);
        const isGroup   = jid.endsWith('@g.us');

        // Every identity we have for this sender: phone JIDs first, LIDs as fallback.
        const senderIds = [
            sender, m.key.participantPn, m.key.senderPn,
            m.key.participant, m.key.participantLid, m.key.senderLid,
            fromMe ? sock.user?.lid : (!isGroup && jid),
        ].filter(Boolean);

        learnOwnerLid(senderIds);
        const ownerFlag = isOwner(...senderIds);

        const body =
            m.message?.conversation ||
            m.message?.extendedTextMessage?.text ||
            m.message?.imageMessage?.caption ||
            m.message?.videoMessage?.caption ||
            '';

        const prefix  = global.prefix || '!';
        const isCmd   = body.startsWith(prefix);
        const cmdName = isCmd ? body.slice(prefix.length).trim().split(/\s+/)[0].toLowerCase() : '';
        const args    = isCmd ? body.slice(prefix.length).trim().split(/\s+/).slice(1) : [];

        if (process.env.DEBUG_MSGS === 'true') {
            console.log(`[DEBUG] from=${sender} ids=${senderIds.join('|')} owner=${ownerFlag} fromMe=${fromMe} prefix=${JSON.stringify(prefix)} ` +
                        `body=${JSON.stringify(body.slice(0, 60))} isCmd=${isCmd} cmd=${cmdName || '-'} ` +
                        `registered=${cmdName ? cmdRef.commands.has(cmdName) : '-'}`);
        }

        // ── 2. Auto features ──────────────────────────────────────────────────

        await auto.runMessageAutos(sock, jid, m.key, isCmd, fromMe);

        // ── 3. Owner-tag protection ───────────────────────────────────────────

        if (!fromMe) {
            const ownerTagged = await handleOwnerProtection(sock, rawMsg);
            if (ownerTagged) return;
        }

        // ── 4. Guards ─────────────────────────────────────────────────────────

        if (isGroup && !fromMe) {
            const blocked = await antilink.check(sock, jid, sender, body, m.key, ownerFlag);
            if (blocked) return;

            // Profanity filter
            const _abw = cmdRef.commands.get('antibadword');
            if (!isCmd && _abw?.check?.(jid, body)) {
                try {
                    await sock.sendMessage(jid, { delete: rawMsg.key });
                } catch { /* bot may not be admin — silently skip */ }
                return;
            }
        }

        // Group moderation above keeps working in every mode, but command execution is restricted
        const mode = getMode();
        if (!modeAllows(mode, { isGroup, isOwner: ownerFlag || fromMe })) {
            if (process.env.DEBUG_MSGS === 'true' && (isCmd || !fromMe)) {
                console.log(`[DEBUG] ignored by mode "${mode}" (isGroup=${isGroup}, owner=${ownerFlag || fromMe})`);
            }
            return;
        }

        // ── 5. Chatbot ────────────────────────────────────────────────────────

        if (!isCmd && !fromMe) {
            const chatDb = readDb('chatbot.json', { enabled: false });
            if (chatDb.enabled) {
                await chatbot.handle(sock, jid, sender, body, rawMsg);
                return;
            }
        }

        if (!isCmd) return;

        // ── 6. Built-in: menu ─────────────────────────────────────────────────

        if (cmdName === 'menu' || (cmdName === 'help' && !args[0])) {
            const menu     = new VantageMenu();
            const cat      = args[0]?.toLowerCase();
            const count    = new Set(cmdRef.commands.values()).size;
            const menuText = cat ? menu.getCategoryMenu(cat) : menu.getMainMenu(count);

            if (!cat && global.thumb?.length) {
                await sock.sendMessage(jid, {
                    image: global.thumb, caption: menuText,
                }, { quoted: rawMsg }).catch(err => console.error('[MENU]', err.message));
            } else {
                await sock.sendMessage(jid, { text: menuText }, { quoted: rawMsg })
                    .catch(err => console.error('[MENU]', err.message));
            }
            return;
        }

        // ── 7. External command router ────────────────────────────────────────

        await runCommand(cmdRef.commands, cmdName, sock, rawMsg, args, sender, senderIds);
    });
}

module.exports = { attach };
