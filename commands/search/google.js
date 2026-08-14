'use strict';

const config = require('../../config');
const axios  = require('axios');
const { send } = require('../../helpers');

module.exports = {
    name: 'google',
    aliases: ['g', 'search'],
    category: 'search',
    description: 'Search the web',
    usage: `${config.prefix}google <query>`,

    async execute(sock, msg, args) {
        const jid = msg.key.remoteJid;
        try {
            if (!args[0]) {
                return send(sock, jid,
                    `❌ Usage: ${this.usage}\n\nExample: ${config.prefix}google Node.js tutorials`
                );
            }

            const query = args.join(' ');
            const wait  = await sock.sendMessage(jid, { text: '🔍 Searching…' });

            // ── DuckDuckGo Instant Answer API ────────────────────────────────
            // Returns a structured result + related topics.
            // Not Google, but free, no key, and honest about it.
            const res = await axios.get('https://api.duckduckgo.com/', {
                params: {
                    q:               query,
                    format:          'json',
                    no_html:         1,
                    skip_disambig:   1,
                    no_redirect:     1,
                },
                headers: { 'Accept': 'application/json' },
                timeout: 10_000
            });

            const data = res.data;

            // ── Build result text ────────────────────────────────────────────
            let text = `🔍 *${query}*\n\n`;
            let hasContent = false;

            // Instant answer (Wikipedia summary, conversions, definitions, etc.)
            if (data.AbstractText) {
                text += `${data.AbstractText}\n`;
                if (data.AbstractURL) text += `\n🔗 ${data.AbstractURL}\n`;
                text += '\n';
                hasContent = true;
            }

            // Direct answer (e.g. "What time is it", "convert 10kg to lbs")
            if (data.Answer) {
                text += `💡 ${data.Answer}\n\n`;
                hasContent = true;
            }

            // Related topics — filter to ones with actual text
            const topics = (data.RelatedTopics || [])
                .filter(t => t.Text && t.FirstURL)
                .slice(0, hasContent ? 3 : 5);

            if (topics.length) {
                if (hasContent) text += `*Related:*\n`;
                topics.forEach((t, i) => {
                    text += `${i + 1}. ${t.Text}\n🔗 ${t.FirstURL}\n\n`;
                });
                hasContent = true;
            }

            if (!hasContent) {
                return await sock.sendMessage(jid, {
                    text:
                        `❌ No results found for *${query}*.\n\n` +
                        `Try a more specific search, or visit:\n` +
                        `🔗 https://www.google.com/search?q=${encodeURIComponent(query)}`,
                    edit: wait.key
                });
            }

            // Always append a direct Google link so users can go deeper
            text += `🌐 https://www.google.com/search?q=${encodeURIComponent(query)}`;

            await sock.sendMessage(jid, { text: text.trim(), edit: wait.key });

        } catch (err) {
            console.error('[google]', err.message);
            await send(sock, jid, global.mess.error);
        }
    }
};
