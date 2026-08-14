const config = require('../../config');
const axios = require('axios');

module.exports = {
    name: 'movie',
    aliases: ['imdb', 'film'],
    category: 'search',
    description: 'Search movie/TV info',
    usage: `${config.prefix}movie <title>`,
    async execute(sock, msg, args) {
        try {
            const jid = msg.key.remoteJid;
            if (!args[0]) return await sock.sendMessage(jid, { text: `❌ Usage: ${this.usage}` });
            const q = args.join(' ');
            const wait = await sock.sendMessage(jid, { text: '🎬 Searching IMDB...' });
            const res = await axios.get(`http://www.omdbapi.com/?t=${encodeURIComponent(q)}&apikey=${config.omdb_key || 'YOUR_KEY'}`);
            const m = res.data;
            if (m.Response === 'False') return await sock.sendMessage(jid, { text: '❌ Movie not found.', edit: wait.key });
            const text = `🎬 *${m.Title} (${m.Year})*\n\n` +
                         `*Rated:* ${m.Rated}\n*Runtime:* ${m.Runtime}\n*Genre:* ${m.Genre}\n` +
                         `*Director:* ${m.Director}\n*Actors:* ${m.Actors}\n*IMDB:* ${m.imdbRating}\n\n` +
                         `_${m.Plot}_`;
            await sock.sendMessage(jid, { image: { url: m.Poster !== 'N/A' ? m.Poster : undefined }, caption: text, edit: wait.key });
        } catch (e) { console.error(e.message); await sock.sendMessage(msg.key.remoteJid, { text: global.mess.error }); }
    }
};