'use strict';

const config                        = require('../../config');
const VantageMenu                   = require('../../menu');
const { sc, card, TOP, MID, BOT, R } = require('../../lib/messageStyle');

// ── Module export ─────────────────────────────────────────────────────────────

module.exports = {
    name: 'help',
    aliases: ['h', 'cmdinfo'],
    category: 'utility',
    description: 'Get details about a specific command',
    usage: `${config.prefix}help <command>`,

    async execute(sock, msg, args) {
        const jid = msg.key.remoteJid;
        try {
            // Normalise — strip any prefix the user may have included
            const query = args[0]?.toLowerCase().replace(/^[!./\\]/, '');

            if (!query) {
                // Bare !help with no args is intercepted in messages.js before
                // reaching here — this branch is purely a safety net
                return await sock.sendMessage(jid, {
                    text: `❓ ${sc('usage')}: ${sc(this.usage)}\n\n${sc('example')}: ${sc(config.prefix + 'help sticker')}`
                }, { quoted: msg });
            }

            // global.commands is set (and kept in sync) by index.js
            const commands = global.commands;
            if (!commands?.size) {
                return await sock.sendMessage(jid, {
                    text: `⚠️ ${sc('commands not loaded yet. try again in a moment.')}`
                }, { quoted: msg });
            }

            // Direct name match
            const cmd = commands.get(query);
            if (cmd) {
                return await sock.sendMessage(jid, {
                    text: buildInfo(cmd, config.prefix)
                }, { quoted: msg });
            }

            // Alias search
            let found = null;
            for (const [, c] of commands) {
                if (c.aliases?.includes(query)) { found = c; break; }
            }

            if (!found) {
                // Check if the query is a category name and route there instead
                const categories = new Set(
                    [...commands.values()]
                        .map(c => c.category?.toLowerCase())
                        .filter(Boolean)
                );

                if (categories.has(query)) {
                    const menu = new VantageMenu();
                    return await sock.sendMessage(jid, {
                        text: menu.getCategoryMenu(query)
                    }, { quoted: msg });
                }

                return await sock.sendMessage(jid, {
                    text: [
                        TOP,
                        `${R} ❌ ${sc('command not found')}: *${query}*`,
                        MID,
                        `${R} 💡 ${sc('tips')}`,
                        `${R} ├─ ${sc('command info')}: ${config.prefix}help <command>`,
                        `${R} ├─ ${sc('category menu')}: ${config.prefix}menu <category>`,
                        `${R} └─ ${sc('all commands')}: ${config.prefix}menu`,
                        BOT,
                    ].join('\n')
                }, { quoted: msg });
            }

            // Alias hit — show card with alias note folded into the header
            await sock.sendMessage(jid, {
                text: buildInfo(found, config.prefix, query)
            }, { quoted: msg });

        } catch (err) {
            console.error('[help]', err.message);
            await sock.sendMessage(msg.key.remoteJid, { text: global.mess.error });
        }
    }
};

// ── Card builder ──────────────────────────────────────────────────────────────

function buildInfo(cmd, prefix, aliasUsed = null) {
    const header = [
        `🧩 ${sc('command name')}: ${sc(cmd.name)}`,
        `📂 ${sc('category')}: ${sc(cmd.category || 'general')}`,
    ];
    if (aliasUsed)           header.push(`🔀 ${sc('alias of')}: ${sc(aliasUsed)} → ${sc(cmd.name)}`);
    if (cmd.ownerOnly)       header.push(`👑 ${sc('owner only')}: ${sc('yes')}`);
    if (cmd.weight === 'heavy') header.push(`⚙️  ${sc('type')}: ${sc('heavy')}`);

    const body = [
        `📝 ${sc('description')}`,
        `└─ ${sc(cmd.description || 'no description available')}`,
        '',
        `💡 ${sc('usage')}`,
        `└─ ${sc(cmd.usage || `${prefix}${cmd.name}`)}`,
    ];
    if (cmd.aliases?.length) {
        body.push('', `🔗 ${sc('aliases')}`, `└─ ${cmd.aliases.map(a => `${prefix}${sc(a)}`).join(', ')}`);
    }

    return card(`⌬【 ${sc('command help')} 】`, header, body);
}
