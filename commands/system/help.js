'use strict';

const config = require('../../config');

module.exports = {
    name: 'help',
    aliases: ['h', 'cmdinfo'],
    category: 'utility',
    description: 'Get details about a specific command',
    usage: `${config.prefix}help <command>`,

    async execute(sock, msg, args) {
        const jid = msg.key.remoteJid;
        try {
            // Normalise — strip prefix if user typed it
            const cmdName = args[0]?.toLowerCase().replace(/^[!./\\]/, '');

            if (!cmdName) {
                // Bare !help with no args is intercepted in messages.js before
                // reaching here — but just in case, send usage hint
                return await sock.sendMessage(jid, {
                    text: `❓ Usage: ${this.usage}\n\nExample: ${config.prefix}help sticker`
                }, { quoted: msg });
            }

            // global.commands is the Map set by the command loader in index.js
            const commands = global.commands;
            if (!commands?.size) {
                return await sock.sendMessage(jid, {
                    text: '⚠️ Commands not loaded yet. Try again in a moment.'
                }, { quoted: msg });
            }

            const cmd = commands.get(cmdName);
            if (!cmd) {
                // Try to find it as an alias
                let found = null;
                for (const [, c] of commands) {
                    if (c.aliases?.includes(cmdName)) { found = c; break; }
                }
                if (!found) {
                    return await sock.sendMessage(jid, {
                        text: `❌ *${cmdName}* not found.\n\nType ${config.prefix}menu to see all commands.`
                    }, { quoted: msg });
                }
                // Redirect to canonical name
                return await sock.sendMessage(jid, {
                    text:
                        `ℹ️ *${cmdName}* is an alias for *${found.name}*.\n\n` +
                        buildInfo(found, config.prefix)
                }, { quoted: msg });
            }

            await sock.sendMessage(jid, {
                text: buildInfo(cmd, config.prefix)
            }, { quoted: msg });

        } catch (err) {
            console.error('[help]', err.message);
            await sock.sendMessage(msg.key.remoteJid, { text: global.mess.error });
        }
    }
};

// ── Helpers ───────────────────────────────────────────────────────────────────

function buildInfo(cmd, prefix) {
    const lines = [
        `📖 *${cmd.name}*`,
        ``,
        `📝 *Description:* ${cmd.description || 'No description'}`,
        `📂 *Category:*    ${cmd.category    || 'Unknown'}`,
        `💡 *Usage:*       ${cmd.usage       || `${prefix}${cmd.name}`}`,
    ];

    if (cmd.aliases?.length) {
        lines.push(`🔣 *Aliases:*     ${cmd.aliases.join(', ')}`);
    }
    if (cmd.ownerOnly) {
        lines.push(`👑 *Owner only:*  Yes`);
    }
    if (cmd.weight === 'heavy') {
        lines.push(`⚙️ *Type:*        Heavy (concurrency limited)`);
    }

    return lines.join('\n');
}
