'use strict';
const config   = require('../../config');
const { send } = require('../../helpers');
const { ytdlp } = require('../../lib/ytdlp');

module.exports = {
    name: 'song',
    aliases: ['music', 'dl'],
    category: 'download',
    description: 'Download a song as MP3',
    weight: 'heavy',
    usage: `${config.prefix}song <query or YouTube URL>`,

    async execute(sock, msg, args) {
        const jid = msg.key.remoteJid;
        try {
            if (!args[0]) return await send(sock, jid, `❌ Usage: ${this.usage}`);

            const query = args.join(' ');
            const wait  = await sock.sendMessage(jid, { text: '🎵 Searching…' });

            const result = await ytdlp(query, {
                type:    'audio',
                format:  'mp3',
                maxSecs: 900   // 15-minute cap
            });

            await sock.sendMessage(jid, { delete: wait.key });

            await sock.sendMessage(jid, {
                audio:    result.buffer,
                mimetype: 'audio/mpeg',
                fileName: `${result.title}.mp3`,
                ptt:      false
            }, { quoted: msg });

            await sock.sendMessage(jid, {
                text: `🎵 *${result.title}*\n⏱ ${result.duration} · 🎤 ${result.uploader}`
            });

        } catch (err) {
            console.error('[song]', err.message);
            const friendly = err.message.includes('too long')
                ? '❌ Song is too long (max 15 minutes).'
                : err.message.includes('unavailable')
                ? '❌ Video is unavailable or age-restricted.'
                : err.message.includes('not installed')
                ? '❌ yt-dlp is not installed. See INSTALL.md.'
                : global.mess.error;
            await sock.sendMessage(jid, { text: friendly });
        }
    }
};
