'use strict';

const config = require('../../config');
const { send } = require('../../helpers');

module.exports = {
    name: 'mock',
    aliases: ['sarcasm', 'spongebob'],
    category: 'fun',
    description: 'Mock text with alternating caps (reply or provide text)',
    usage: `${config.prefix}mock <text>  OR  reply to a message`,

    async execute(sock, msg, args) {
        const jid = msg.key.remoteJid;
        try {
            // ── Resolve text ─────────────────────────────────────────────────
            // Priority: quoted message text → args → usage error
            let text = '';

            const quoted = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
            const quotedText =
                quoted?.conversation ||
                quoted?.extendedTextMessage?.text ||
                quoted?.imageMessage?.caption ||
                quoted?.videoMessage?.caption ||
                '';

            if (quotedText) {
                text = quotedText;
            } else if (args[0]) {
                text = args.join(' ');
            } else {
                return send(sock, jid, `❌ Usage: ${this.usage}`);
            }

            const mocked = text
                .split('')
                .map((c, i) => i % 2 === 0 ? c.toLowerCase() : c.toUpperCase())
                .join('');

            await sock.sendMessage(jid, { text: `🗿 ${mocked}` }, { quoted: msg });

        } catch (err) {
            console.error('[mock]', err.message);
            await send(sock, jid, global.mess.error);
        }
    }
};
