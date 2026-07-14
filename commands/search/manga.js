const config = require('../../config');
const axios = require('axios');

module.exports = {
    name: 'manga',
    aliases: ['mg'],
    category: 'search',
    description: 'Search manga info',
    usage: `${config.prefix}manga <title>`,
    async execute(sock, msg, args) {
        try {
            const jid = msg.key.remoteJid;
            if (!args[0]) return await sock.sendMessage(jid, { text: `❌ Usage: ${this.usage}` });
            const q = args.join(' ');
            const wait = await sock.sendMessage(jid, { text: '🔍 Searching manga...' });
            const res = await axios.get(`https://api.jikan.moe/v4/manga?q=${encodeURIComponent(q)}&limit=1`);
            const m = res.data.data[0];
            if (!m) return await sock.sendMessage(jid, { text: '❌ No results.', edit: wait.key });
            const text = `📚 *${m.title}*\n\n` +
                         `*Type:* ${m.type}\n*Chapters:* ${m.chapters || '?'}\n*Status:* ${m.status}\n*Score:* ${m.score}\n` +
                         `*Published:* ${m.published?.string}\n\n${m.synopsis?.substring(0, 400)}...\n\n🔗 ${m.url}`;
            await sock.sendMessage(jid, { image: { url: m.images?.jpg?.large_image_url }, caption: text, edit: wait.key });
        } catch (e) { console.error(e.message); await sock.sendMessage(msg.key.remoteJid, { text: global.mess.error }); }
    }
};