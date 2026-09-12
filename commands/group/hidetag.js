'use strict';

const config         = require('../../config');
const { send, getGroupContext, makeDB } = require('../../helpers');

const db = makeDB('hidetag.json', {});

module.exports = {
    name: 'hidetag',
    aliases: ['hall', 'htag'],
    category: 'group',
    description: 'Tag all members silently with a configurable message',
    usage: `${config.prefix}hidetag [message]  |  reply to a message  |  set <message>`,

    async execute(sock, msg, args) {
        const jid = msg.key.remoteJid;
        try {
            if (!jid.endsWith('@g.us')) return send(sock, jid, global.mess.group);

            const ctx = await getGroupContext(sock, msg);
            if (!ctx.senderIsAdmin) return send(sock, jid, global.mess.admin);

            const participants = ctx.meta.participants.map(p => p.id);

            // ── !hidetag set <message> — save a new default for this group ────
            if (args[0]?.toLowerCase() === 'set') {
                const newMsg = args.slice(1).join(' ').trim();
                if (!newMsg) return send(sock, jid, `❌ Usage: ${config.prefix}hidetag set <your message>`);
                const settings = db.load();
                if (!settings[jid]) settings[jid] = {};
                settings[jid].message = newMsg;
                db.save(settings);
                return send(sock, jid, `✅ Default hidetag message saved.`);
            }

            // ── Resolve message: args → quoted text → saved default → emoji ───
            let text = '';
            if (args.length) {
                text = args.join(' ').trim();
            } else {
                const quoted    = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
                const quotedText =
                    quoted?.conversation ||
                    quoted?.extendedTextMessage?.text ||
                    quoted?.imageMessage?.caption ||
                    quoted?.videoMessage?.caption ||
                    '';
                if (quotedText) {
                    text = quotedText;
                } else {
                    const settings = db.load();
                    text = settings[jid]?.message || '👋';
                }
            }

            // The text is visible, the mentions are invisible — no @names shown
            await sock.sendMessage(jid, { text, mentions: participants }, { quoted: msg });

        } catch (err) {
            console.error('[hidetag]', err.message);
            await send(sock, jid, global.mess.error);
        }
    }
};
