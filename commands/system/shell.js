'use strict';

const config        = require('../../config');
const { exec }      = require('child_process');
const { promisify } = require('util');
const { send }      = require('../../helpers');

const execAsync = promisify(exec);

module.exports = {
    name: 'shell',
    aliases: ['term', '$'],
    category: 'owner',
    description: 'Execute a shell command',
    usage: `${config.prefix}shell <command>`,
    ownerOnly: true,

    async execute(sock, msg, args) {
        const jid = msg.key.remoteJid;
        try {
            if (!args[0]) return send(sock, jid, `❌ Usage: ${this.usage}`);

            const command = args.join(' ');
            const wait    = await sock.sendMessage(jid, {
                text: `⬡ ᴠx-sʜᴇʟʟ — running…`
            });

            let output, isError = false;
            try {
                const { stdout, stderr } = await execAsync(command, { timeout: 30_000 });
                output = (stdout || stderr || '(no output)').trim();
            } catch (e) {
                output  = (e.stderr || e.message || 'Unknown error').trim();
                isError = true;
            }

            if (output.length > 3000) output = output.slice(0, 3000) + '\n… (truncated)';

            await sock.sendMessage(jid, {
                text:
                    `⬡ ᴠx-sʜᴇʟʟ — ${isError ? 'error' : 'ok'}\n` +
                    `▸ $ ${command}\n` +
                    `\`\`\`${output}\`\`\``,
                edit: wait.key
            });

        } catch (err) {
            console.error('[shell]', err.message);
            await send(sock, jid, global.mess.error);
        }
    }
};
