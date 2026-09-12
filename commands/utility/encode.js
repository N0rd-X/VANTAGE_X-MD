'use strict';

const config   = require('../../config');
const { send } = require('../../helpers');

// Supported types
const TYPES = ['base64', 'hex', 'binary', 'url', 'ascii'];

module.exports = {
    name: 'encode',
    aliases: ['enc'],
    category: 'utility',
    description: 'Encode text to base64, hex, binary, url or ascii',
    usage: `${config.prefix}encode <text> | <type>`,

    async execute(sock, msg, args) {
        const jid = msg.key.remoteJid;
        try {
            const input = args.join(' ').trim();

            if (!input || !input.includes('|')) {
                return send(sock, jid,
                    `❌ Usage: ${this.usage}\n\n` +
                    `Examples:\n` +
                    `${config.prefix}encode Hello World | base64\n` +
                    `${config.prefix}encode Hi | hex\n` +
                    `${config.prefix}encode Hello | binary\n\n` +
                    `Types: ${TYPES.join(', ')}`
                );
            }

            // Split on the LAST | so text can contain | characters
            const lastPipe = input.lastIndexOf('|');
            const text     = input.slice(0, lastPipe).trim();
            const type     = input.slice(lastPipe + 1).trim().toLowerCase();

            if (!text)              return send(sock, jid, '❌ Text cannot be empty.');
            if (!TYPES.includes(type)) return send(sock, jid, `❌ Unknown type *${type}*\n\nAvailable: ${TYPES.join(', ')}`);

            let result;
            if      (type === 'base64') result = Buffer.from(text).toString('base64');
            else if (type === 'hex')    result = Buffer.from(text).toString('hex');
            else if (type === 'binary') result = [...text].map(c => c.charCodeAt(0).toString(2).padStart(8, '0')).join(' ');
            else if (type === 'url')    result = encodeURIComponent(text);
            else if (type === 'ascii')  result = [...text].map(c => c.charCodeAt(0)).join(' ');

            await sock.sendMessage(jid, {
                text: `🔢 *${type.toUpperCase()} Encoded*\n\n\`\`\`${result}\`\`\``
            }, { quoted: msg });

        } catch (err) {
            console.error('[encode]', err.message);
            await send(sock, jid, global.mess.error);
        }
    }
};
