'use strict';

const config = require('../../config');
const axios  = require('axios');
const { send } = require('../../helpers');

module.exports = {
    name: 'meme',
    aliases: ['memes', 'rmeme', 'randommeme', 'dailymeme'],
    category: 'fun',
    description: 'Get a random meme',
    usage: `${config.prefix}meme`,

    async execute(sock, msg, args) {
        const jid = msg.key.remoteJid;
        try {
            const res  = await axios.get('https://meme-api.com/gimme', { timeout: 10_000 });
            const data = res.data;

            if (!data?.url) return send(sock, jid, '❌ Could not fetch a meme right now. Try again.');

            // Retry silently if NSFW — one extra attempt
            if (data.nsfw) {
                const retry = await axios.get('https://meme-api.com/gimme', { timeout: 10_000 });
                if (!retry.data?.url || retry.data.nsfw) {
                    return send(sock, jid, '⚠️ Got an NSFW meme twice in a row. Try again in a moment.');
                }
                return await sock.sendMessage(jid, {
                    image:   { url: retry.data.url },
                    caption: `😂 *${retry.data.title}*\n\n📌 r/${retry.data.subreddit} · ⬆️ ${retry.data.ups?.toLocaleString() || '?'} upvotes`
                }, { quoted: msg });
            }

            await sock.sendMessage(jid, {
                image:   { url: data.url },
                caption: `😂 *${data.title}*\n\n📌 r/${data.subreddit} · ⬆️ ${data.ups?.toLocaleString() || '?'} upvotes`
            }, { quoted: msg });

        } catch (err) {
            console.error('[meme]', err.message);
            await send(sock, jid, global.mess.error);
        }
    }
};
