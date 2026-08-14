'use strict';

const config   = require('../../config');
const { send } = require('../../helpers');

module.exports = {
    name: 'decode',
    aliases: ['dec'],
    category: 'utility',
    description: 'Decode base64, hex, or binary',
    usage: `${config.prefix}decode <base64|hex|binary> <text>`,

    async execute(sock, msg, args) {
        const jid = msg.key.remoteJid;
        try {
            if (args.length < 2) {
                return send(sock, jid,
                    `❌ Usage: ${this.usage}\n\n` +
                    `Examples:\n` +
                    `${config.prefix}decode base64 SGVsbG8gV29ybGQ=\n` +
                    `${config.prefix}decode hex 48656c6c6f\n` +
                    `${config.prefix}decode binary 01001000 01101001`
                );
            }

            const type = args[0].toLowerCase();
            const text = args.slice(1).join(' ');
            let   result;

            if (type === 'base64') {
                result = Buffer.from(text, 'base64').toString('utf8');
            } else if (type === 'hex') {
                if (!/^[0-9a-fA-F\s]+$/.test(text)) return send(sock, jid, '❌ Invalid hex input.');
                result = Buffer.from(text.replace(/\s/g, ''), 'hex').toString('utf8');
            } else if (type === 'binary') {
                if (!/^[01\s]+$/.test(text)) return send(sock, jid, '❌ Invalid binary input — only 0s and 1s.');
                result = text.trim().split(/\s+/).map(b => String.fromCharCode(parseInt(b, 2))).join('');
            } else {
                return send(sock, jid, `❌ Unknown type *${type}*\n\nAvailable: base64, hex, binary`);
            }

            await sock.sendMessage(jid, {
                text: `🔓 *${type.toUpperCase()} Decoded*\n\n${result}`
            }, { quoted: msg });

        } catch (err) {
            console.error('[decode]', err.message);
            await send(sock, jid, '❌ Invalid input — could not decode.');
        }
    }
};
