'use strict';

const config   = require('../../config');
const { send } = require('../../helpers');
const READMORE_SEP = '\u200E\n'.repeat(2700) + '\u200E';

module.exports = {
    name: 'readmore',
    aliases: ['spoiler', 'rm'],
    category: 'utility',
    description: 'Hide text behind a WhatsApp "Read more" collapse',
    usage: `${config.prefix}readmore <visible text> | <hidden text>`,

    async execute(sock, msg, args) {
        const jid = msg.key.remoteJid;
        try {
            const input = args.join(' ').trim();

            if (!input) {
                return send(sock, jid,
                    `❌ Usage: ${this.usage}\n\n` +
                    `Example: ${config.prefix}readmore Click to reveal | This is the hidden part!`
                );
            }

            // Support "visible | hidden" split for clarity
            // Falls back to first word visible + rest hidden if no | present
            let visible, hidden;

            if (input.includes('|')) {
                [visible, ...hidden] = input.split('|').map(s => s.trim());
                hidden = hidden.join('|').trim();
            } else {
                const words = input.split(' ');
                visible = words[0];
                hidden  = words.slice(1).join(' ');
            }

            if (!hidden) {
                return send(sock, jid, '❌ Need at least two parts — use: visible text | hidden text');
            }

            const text = `${visible}${READMORE_SEP}${hidden}`;
            await sock.sendMessage(jid, { text }, { quoted: msg });

        } catch (err) {
            console.error('[readmore]', err.message);
            await send(sock, jid, global.mess.error);
        }
    }
};
