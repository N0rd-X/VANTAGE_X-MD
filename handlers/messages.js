'use strict';

const { smsg }   = require('../lib/myfunc');
const { readDb } = require('../lib/db');
const { isOwner, run: runCommand } = require('../services/commands');
const chatbot     = require('../services/chatbot');
const antilink    = require('../services/antilink');
const auto        = require('./auto');
const { handleOwnerProtection } = require('./ownerMentions');
const VantageMenu = require('../menu');

function attach(sock, cmdRef) {
    sock.ev.on('messages.upsert', async ({ messages, type }) => {
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
        const sender    = sock.decodeJid(fromMe ? sock.user.id : (m.key.participant || jid));
        const isGroup   = jid.endsWith('@g.us');
        const ownerFlag = isOwner(sender);

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

        // ── 2. Auto features ──────────────────────────────────────────────────

        await auto.runMessageAutos(sock, jid, m.key, isCmd, fromMe);

        // ── 3. Owner-tag protection ───────────────────────────────────────────

        if (!fromMe) {
            const ownerTagged = await handleOwnerProtection(sock, rawMsg);
            if (ownerTagged) return;
        }

        // ── 4. Guards ─────────────────────────────────────────────────────────

        if (global.anti92 && !fromMe) {
            if (sender.replace(/[^0-9]/g, '').startsWith('92')) return;
        }

        if (isGroup && !fromMe) {
            const blocked = await antilink.check(sock, jid, sender, body, m.key, ownerFlag);
            if (blocked) return;
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
            const count    = cmdRef.commands.size;
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

        await runCommand(cmdRef.commands, cmdName, sock, rawMsg, args, sender);
    });
}

module.exports = { attach };

