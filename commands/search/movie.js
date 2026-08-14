'use strict';
const config = require('../../config');
const axios  = require('axios');
const { send } = require('../../helpers');

module.exports = {
    name: 'movie',
    aliases: ['imdb', 'film'],
    category: 'search',
    description: 'Search movie/TV info',
    usage: `${config.prefix}movie <title>`,

    async execute(sock, msg, args) {
        const jid = msg.key.remoteJid;
        try {
            if (!args.length) return send(sock, jid, `❌ Usage: ${this.usage}`);
            if (!config.omdb_key) return send(sock, jid, "❌ Movie search isn't configured yet — the bot owner needs to set `omdb_key` in config (free at omdbapi.com).");

            const q    = args.join(' ');
            const wait = await send(sock, jid, '🎬 Searching IMDB...');
            const res  = await axios.get(`https://www.omdbapi.com/?t=${encodeURIComponent(q)}&apikey=${config.omdb_key}`, { timeout: 7000 });
            const m    = res.data;

            if (m.Response === 'False') return sock.sendMessage(jid, { text: '❌ Movie not found.', edit: wait.key });

            const text = `🎬 *${m.Title} (${m.Year})*\n\n` +
                `*Rated:* ${m.Rated}\n*Runtime:* ${m.Runtime}\n*Genre:* ${m.Genre}\n` +
                `*Director:* ${m.Director}\n*Actors:* ${m.Actors}\n*IMDB:* ${m.imdbRating}\n\n_${m.Plot}_`;

            await sock.sendMessage(jid, {
                image:   m.Poster !== 'N/A' ? { url: m.Poster } : undefined,
                caption: text,
                edit:    wait.key,
            });
        } catch (err) {
            console.error('[movie]', err.message);
            await send(sock, jid, global.mess.error);
        }
    },
};
