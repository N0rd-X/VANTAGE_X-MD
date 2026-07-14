'use strict';

/**
 * Main message pipeline. Ordered and thin — each step delegates to a service.
 */

const { smsg }   = require('../lib/myfunc');
const { readDb } = require('../lib/db');
const { isOwner, run: runCommand } = require('../services/commands');
const chatbot     = require('../services/chatbot');
const antilink    = require('../services/antilink');
const auto        = require('./auto');
const { handleOwnerProtection } = require('./ownerMentions');
const Vantage_XMenu = require('../menu');

/**
 * Attach the main messages.upsert handler.
 *
 * @param {object} sock     - Baileys socket
 * @param {Map}    commands - loaded command map (passed by reference — hot-reload safe)
 * @param {object} cmdRef   - { commands } wrapper so hot-reload updates propagate
 */
function attach(sock, cmdRef) {
    sock.ev.on('messages.upsert', async ({ messages, type }) => {
        if (type !== 'notify') return;

        const rawMsg = messages[0];
        if (!rawMsg?.message) return;

        // Unwrap ephemeral messages
        if (Object.keys(rawMsg.message)[0] === 'ephemeralMessage') {
            rawMsg.message = rawMsg.message.ephemeralMessage.message;
        }

        // Ignore Baileys internal messages
        if (rawMsg.key.id?.startsWith('BAE5') && rawMsg.key.id.length === 16) return;

        // ── 1. Parse & normalise ─────────────────────────────────────────────

        const m      = smsg(sock, rawMsg, {});
        const jid    = m.key.remoteJid;
        if (!jid) return;

        const fromMe   = m.key.fromMe;
        const sender   = sock.decodeJid(fromMe ? sock.user.id : (m.key.participant || jid));
        const isGroup  = jid.endsWith('@g.us');
        const pushName = m.pushName || 'User';

        const body =
            m.message?.conversation ||
            m.message?.extendedTextMessage?.text ||
            m.message?.imageMessage?.caption ||
            m.message?.videoMessage?.caption ||
            '';

        const prefix    = global.prefix || '!';
        const isCmd     = body.startsWith(prefix);
        const cmdName   = isCmd ? body.slice(prefix.length).trim().split(/\s+/)[0].toLowerCase() : '';
        const args      = isCmd ? body.slice(prefix.length).trim().split(/\s+/).slice(1) : [];
        const text      = args.join(' ');
        const ownerFlag = isOwner(sender);

        // ── 2. Auto features ─────────────────────────────────────────────────

        await auto.runMessageAutos(sock, jid, m.key, isCmd, fromMe);

        // ── 3. Owner-tag protection ───────────────────────────────────────────
        // (moved here from lib/ownerMentions.js — was written but never
        // actually wired into the pipeline)

        if (!fromMe) {
            const ownerTagged = await handleOwnerProtection(sock, rawMsg);
            if (ownerTagged) return;
        }

        // ── 4. Guards ────────────────────────────────────────────────────────

        // Anti-92 (block numbers from a specific region)
        if (global.anti92 && !fromMe) {
            const num = sender.replace(/[^0-9]/g, '');
            if (num.startsWith('92')) return;
        }

        // Anti-link
        if (isGroup && !fromMe) {
            const blocked = await antilink.check(sock, jid, sender, body, m.key, ownerFlag);
            if (blocked) return;
        }

        // ── 5. Chatbot ───────────────────────────────────────────────────────

        if (!isCmd && !fromMe) {
            const chatDb = readDb('chatbot.json', { enabled: false });
            if (chatDb.enabled) {
                await chatbot.handle(sock, jid, sender, body, rawMsg);
                return;
            }
        }

        // ── 6. Command routing ───────────────────────────────────────────────

        if (!isCmd) return;

        // Built-in: menu
        if (cmdName === 'menu' || cmdName === 'help') {
            const menu  = new Vantage_XMenu();
            const cat   = args[0]?.toLowerCase();
            const count = cmdRef.commands.size;

            const menuText = (cat && cat !== 'help')
                ? menu.getCategoryMenu(cat)
                : menu.getMainMenu(count);

            if (!cat && global.thumb?.length) {
                await sock.sendMessage(jid, {
                    image:   global.thumb,
                    caption: menuText,
                }, { quoted: rawMsg })
                    .catch(err => console.error('[MENU]', err.message));
            } else {
                await sock.sendMessage(jid, { text: menuText }, { quoted: rawMsg })
                    .catch(err => console.error('[MENU]', err.message));
            }
            return;
        }

        // Built-in: alive
        if (cmdName === 'alive') {
            const menu = new Vantage_XMenu();
            await sock.sendMessage(jid, { text: menu.getAliveMessage() }, { quoted: rawMsg })
                .catch(err => console.error('[ALIVE]', err.message));
            return;
        }

        // External commands
        const ctx = {
            jid, sender, isGroup, fromMe,
            pushName, text, body, args,
            ownerFlag, prefix, m,
        };

        await runCommand(cmdRef.commands, cmdName, sock, rawMsg, args, ctx);
    });
}

module.exports = { attach };
