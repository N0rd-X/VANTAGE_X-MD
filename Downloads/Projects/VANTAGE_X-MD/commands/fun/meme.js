const config = require('../../config');
const axios = require('axios');

module.exports = {
    name: 'meme',
    aliases: ['memes', 'randommeme'],
    category: 'fun',
    description: 'Get a random meme',
    usage: `${config.prefix}meme`,

    async execute(sock, msg, args) {
        try {
            const jid = msg.key.remoteJid;

            const res = await axios.get('https://meme-api.com/gimme');
            const data = res.data;

            if (!data || !data.url) {
                return await sock.sendMessage(jid, { text: '❌ Could not fetch a meme right now. Try again!' });
            }

            if (data.nsfw) {
                return await sock.sendMessage(jid, { text: '⚠️ Got an NSFW meme. Try again for a safe one!' });
            }

            await sock.sendMessage(jid, {
                image: { url: data.url },
                caption: `😂 *${data.title}*\n\n📌 r/${data.subreddit} · ⬆️ ${data.ups?.toLocaleString() || '?'} upvotes`
            });

        } catch (error) {
            console.error('Meme error:', error.message);
            await sock.sendMessage(msg.key.remoteJid, { text: global.mess.error });
        }
    }
};