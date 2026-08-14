'use strict';

const config   = require('../../config');
const util     = require('util');
const { send } = require('../../helpers');

module.exports = {
    name: 'eval',
    aliases: ['exec', '>'],
    category: 'owner',
    description: 'Execute JavaScript code',
    usage: `${config.prefix}eval <code>`,
    ownerOnly: true,

    async execute(sock, msg, args) {
        const jid = msg.key.remoteJid;
        try {
            if (!args.length) return send(sock, jid, `❌ Usage: ${this.usage}`);

            const code = args.join(' ');
            const wait = await sock.sendMessage(jid, {
                text: `⬡ ᴠx-ᴇᴠᴀʟ — running…`
            });

            let result, isError = false;
            try {
                result = await eval(code);
                if (typeof result !== 'string') result = util.inspect(result, { depth: 3 });
                if (result.length > 3000) result = result.slice(0, 3000) + '\n… (truncated)';
            } catch (e) {
                result  = e.message;
                isError = true;
            }

            await sock.sendMessage(jid, {
                text:
                    `⬡ ᴠx-ᴇᴠᴀʟ — ${isError ? 'error' : 'ok'}\n` +
                    `▸ Input\n\`\`\`${code}\`\`\`\n` +
                    `▸ ${isError ? 'Error' : 'Output'}\n\`\`\`${result}\`\`\``,
                edit: wait.key
            });

        } catch (err) {
            console.error('[eval]', err.message);
            await send(sock, jid, global.mess.error);
        }
    }
};
