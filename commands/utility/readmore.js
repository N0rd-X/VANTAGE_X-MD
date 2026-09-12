'use strict';

const config   = require('../../config');
const { send } = require('../../helpers');

// Root cause of the double "Read more" bug:
// '\u200E\n'.repeat(2700) inserts 2700 REAL newlines into the message bubble.
// WhatsApp renders those newlines, creating a massive bubble with the hidden
// text pushed 2700 lines down — then collapses that into a second Read More.
//
// Fix: no newlines in the separator. Just invisible LTR marks repeated until
// WhatsApp triggers the collapse (~4001 minimum).
const READMORE_SEP = '\u200E'.repeat(4001);

module.exports = {
    name: 'readmore',
    aliases: ['spoiler', 'rm'],
    category: 'utility',
    description: 'Hide text behind a WhatsApp "Read more" collapse',
    usage: `${config.prefix}readmore <visible> | <hidden>`,

    async execute(sock, msg, args) {
        const jid = msg.key.remoteJid;
        try {
            const input = args.join(' ').trim();

            if (!input) {
                return send(sock, jid,
                    `❌ Usage: ${this.usage}\n\n` +
                    `Example: ${config.prefix}readmore Tap to read | Hidden content here`
                );
            }

            let visible, hidden;

            if (input.includes('|')) {
                const lastPipe = input.lastIndexOf('|');
                visible = input.slice(0, lastPipe).trim();
                hidden  = input.slice(lastPipe + 1).trim();
            } else {
                const words = input.split(' ');
                visible = words[0];
                hidden  = words.slice(1).join(' ');
            }

            if (!visible) return send(sock, jid, '❌ Visible text cannot be empty.');
            if (!hidden)  return send(sock, jid, '❌ Need something to hide — use: visible | hidden');

            await sock.sendMessage(jid, {
                text: `${visible}${READMORE_SEP}${hidden}`
            }, { quoted: msg });

        } catch (err) {
            console.error('[readmore]', err.message);
            await send(sock, jid, global.mess.error);
        }
    }
};
