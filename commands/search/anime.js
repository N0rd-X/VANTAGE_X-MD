'use strict';

const config = require('../../config');
const axios  = require('axios');
const { send } = require('../../helpers');

module.exports = {
    name: 'anime',
    aliases: ['animesearch', 'animelookup'],
    category: 'search',
    description: 'Search anime info',
    usage: `${config.prefix}anime <title>`,

    async execute(sock, msg, args) {
        const jid = msg.key.remoteJid;
        try {
            if (!args[0]) return send(sock, jid, `❌ Usage: ${this.usage}`);

            const query = args.join(' ');
            const wait  = await sock.sendMessage(jid, { text: '🔍 Searching anime…' });

            const res = await axios.get(
                `https://api.jikan.moe/v4/anime?q=${encodeURIComponent(query)}&limit=1`,
                { timeout: 10_000 }
            );
            const a = res.data?.data?.[0];

            if (!a) {
                return await sock.sendMessage(jid, {
                    text: `❌ No results for *${query}*.`,
                    edit: wait.key
                });
            }

            const synopsis = a.synopsis
                ? a.synopsis.substring(0, 400) + (a.synopsis.length > 400 ? '…' : '')
                : 'No synopsis available.';

            const text =
                `🎌 *${a.title}*\n\n` +
                `*Type:*     ${a.type || 'N/A'}\n` +
                `*Episodes:* ${a.episodes || '?'}\n` +
                `*Status:*   ${a.status || 'N/A'}\n` +
                `*Score:*    ${a.score || 'N/A'}\n` +
                `*Aired:*    ${a.aired?.string || 'N/A'}\n` +
                `*Rating:*   ${a.rating || 'N/A'}\n\n` +
                `${synopsis}\n\n` +
                `🔗 ${a.url}`;

            const imageUrl = a.images?.jpg?.large_image_url;

            if (imageUrl) {
                await sock.sendMessage(jid, {
                    image:   { url: imageUrl },
                    caption: text,
                    edit:    wait.key
                });
            } else {
                await sock.sendMessage(jid, { text, edit: wait.key });
            }

        } catch (err) {
            console.error('[anime]', err.message);
            await send(sock, jid, global.mess.error);
        }
    }
};
