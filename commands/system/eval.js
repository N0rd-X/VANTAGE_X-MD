'use strict';

const config               = require('../../config');
const util                 = require('util');
const { send, ownerGuard } = require('../../helpers');

const AsyncFunction = Object.getPrototypeOf(async function () {}).constructor;

module.exports = {
    name:        'eval',
    aliases:     ['exec', '>'],
    category:    'system',
    description: "Execute JavaScript in the bot's runtime context",
    usage:       `${config.prefix}eval <code>`,
    ownerOnly:   true,

    async execute(sock, msg, args) {
        const jid = msg.key.remoteJid;

        // Defense in depth
        // eval is the highest-risk command in the entire bot
        if (await ownerGuard(sock, msg)) return;

        if (!args.length) return send(sock, jid, `❌ Usage: ${this.usage}`);

        const code = args.join(' ');
        const wait = await sock.sendMessage(jid, { text: '⬡ ᴠx-ᴇᴠᴀʟ — running…' });

        const start = Date.now();
        let result, isError = false;

        try {
            // Inject the live context so the owner can reference sock, msg, args, etc.
            const fn = new AsyncFunction(
                'sock', 'msg', 'args', 'jid', 'config', 'require',
                code
            );
            result = await fn(sock, msg, args, jid, config, require);

            if (result === undefined)         result = '(undefined)';
            else if (typeof result !== 'string') result = util.inspect(result, { depth: 4, colors: false });
        } catch (e) {
            // Full stack trace, not just the message
            result  = e.stack || e.message;
            isError = true;
        }

        const elapsed = Date.now() - start;
        if (result.length > 3000) result = result.slice(0, 3000) + '\n… (truncated)';

        await sock.sendMessage(jid, {
            text:
                `⬡ ᴠx-ᴇᴠᴀʟ — ${isError ? 'error' : 'ok'} · ${elapsed}ms\n` +
                `▸ Input\n\`\`\`${code}\`\`\`\n` +
                `▸ ${isError ? 'Error' : 'Output'}\n\`\`\`${result}\`\`\``,
            edit: wait.key,
        });
    },
};
