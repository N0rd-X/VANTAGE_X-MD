'use strict';

const config               = require('../../config');
const { exec }             = require('child_process');
const { promisify }        = require('util');
const { send, ownerGuard } = require('../../helpers');

const execAsync = promisify(exec);

module.exports = {
    name:        'shell',
    aliases:     ['term', '$'],
    category:    'system',
    description: 'Execute a shell command in the bot\'s working directory',
    usage:       `${config.prefix}shell <command>`,
    ownerOnly:   true,

    async execute(sock, msg, args) {
        const jid = msg.key.remoteJid;
        if (await ownerGuard(sock, msg)) return;

        if (!args[0]) return send(sock, jid, `❌ Usage: ${this.usage}`);

        const command = args.join(' ');
        const cwd     = process.cwd();
        const wait    = await sock.sendMessage(jid, { text: '⬡ ᴠx-sʜᴇʟʟ — running…' });

        const start = Date.now();
        let output, exitCode = 0, isError = false;

        try {
            const { stdout, stderr } = await execAsync(command, { timeout: 30_000, cwd });
            // Show stdout and stderr when both have content — the old code dropped one
            const parts = [stdout.trim(), stderr.trim()].filter(Boolean);
            output = parts.length === 2
                ? `${parts[0]}\n\n[stderr]\n${parts[1]}`
                : parts[0] || '(no output)';
        } catch (e) {
            // e.killed = true means the 30 s timeout fired
            output   = e.killed
                ? `Timed out after 30 s.\n${(e.stderr || '').trim()}`
                : (e.stderr || e.message || 'Unknown error').trim();
            exitCode = e.code ?? 1;
            isError  = true;
        }

        const elapsed = Date.now() - start;
        if (output.length > 3000) output = output.slice(0, 3000) + '\n… (truncated)';

        await sock.sendMessage(jid, {
            text:
                `⬡ ᴠx-sʜᴇʟʟ — ${isError ? 'error' : 'ok'} · exit ${exitCode} · ${elapsed}ms\n` +
                `▸ ${cwd} $ ${command}\n` +
                `\`\`\`${output}\`\`\``,
            edit: wait.key,
        });
    },
};
