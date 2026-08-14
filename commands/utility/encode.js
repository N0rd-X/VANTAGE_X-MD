'use strict';

const config   = require('../../config');
const { send } = require('../../helpers');

module.exports = {
    name: 'encode',
    aliases: ['enc'],
    category: 'utility',
    description: 'Encode text to base64, hex, or binary',
    usage: `${config.prefix}encode <base64|hex|binary> <text>`,

    async execute(sock, msg, args) {
        const jid = msg.key.remoteJid;
        try {
            if (args.length < 2) {
                return send(sock, jid,
                    `❌ Usage: ${this.usage}\n\n` +
                    `Examples:\n` +
                    `${config.prefix}encode base64 Hello World\n` +
                    `${config.prefix}encode hex Hello\n` +
                    `${config.prefix}encode binary Hi`
                );
            }

            const type = args[0].toLowerCase();
            const text = args.slice(1).join(' ');
            let   result;

            if      (type === 'base64') result = Buffer.from(text).toString('base64');
            else if (type === 'hex')    result = Buffer.from(text).toString('hex');
            else if (type === 'binary') result = text.split('').map(c => c.charCodeAt(0).toString(2).padStart(8, '0')).join(' ');
            else return send(sock, jid, `❌ Unknown type *${type}*\n\nAvailable: base64, hex, binary`);

            await sock.sendMessage(jid, {
                text: `🔢 *${type.toUpperCase()} Encoded*\n\n\`\`\`${result}\`\`\``
            }, { quoted: msg });

        } catch (err) {
            console.error('[encode]', err.message);
            await send(sock, jid, global.mess.error);
        }
    }
};
