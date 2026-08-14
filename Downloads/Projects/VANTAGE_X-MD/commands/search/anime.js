const config = require('../../config');
const axios = require('axios');

module.exports = {
    name: 'anime',
    aliases: ['anim', 'anisearch'],
    category: 'search',
    description: 'Search anime info',
    usage: `${config.prefix}anime <title>`,
    async execute(sock, msg, args) {
        try {
            const jid = msg.key.remoteJid;
            if (!args[0]) return await sock.sendMessage(jid, { text: `❌ Usage: ${this.usage}` });
            const q = args.join(' ');
            const wait = await sock.sendMessage(jid, { text: '🔍 Searching anime...' });
            const res = await axios.get(`https://api.jikan.moe/v4/anime?q=${encodeURIComponent(q)}&limit=1`);
            const a = res.data.data[0];
            if (!a) return await sock.sendMessage(jid, { text: '❌ No results.', edit: wait.key });
            const text = `🎌 *${a.title}*\n\n` +
                         `*Type:* ${a.type}\n*Episodes:* ${a.episodes || '?'}\n*Status:* ${a.status}\n*Score:* ${a.score}\n` +
                         `*Aired:* ${a.aired?.string}\n*Rating:* ${a.rating}\n\n${a.synopsis?.substring(0, 400)}...\n\n🔗 ${a.url}`;
            await sock.sendMessage(jid, { image: { url: a.images?.jpg?.large_image_url }, caption: text, edit: wait.key });
        } catch (e) { console.error(e.message); await sock.sendMessage(msg.key.remoteJid, { text: global.mess.error }); }
    }
};