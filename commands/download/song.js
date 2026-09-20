'use strict';

const config    = require('../../config');
const { send }  = require('../../helpers');
const { ytdlp } = require('../../lib/ytdlp');

module.exports = {
    name: 'song',
    aliases: ['ytmp3', 'ytaudio', 'ytmusic'],
    category: 'download',
    description: 'Download audio as an MP3 file',
    weight: 'heavy',
    usage: `${config.prefix}song <search query or URL>`,

    async execute(sock, msg, args) {
        const jid = msg.key.remoteJid;
        let wait;
        try {
            if (!args[0]) return await send(sock, jid, `❌ Usage: ${this.usage}`);

            const query = args.join(' ');

            wait = await sock.sendMessage(jid, { text: '🎵 Searching…' });

            const result = await ytdlp(query, {
                type:    'audio',
                maxSecs: 900,   // 15-minute cap
            });

            await sock.sendMessage(jid, {
                text: `✅ Found *${result.title}* — sending…`,
                edit: wait.key
            });

            await sock.sendMessage(jid, {
                audio:    result.buffer,
                mimetype: 'audio/mpeg',
                fileName: `${result.title}.mp3`,
                ptt:      false,
            }, { quoted: msg });

            await sock.sendMessage(jid, {
                text: `🎵 *${result.title}*\n⏱ ${result.duration} · 🎤 ${result.uploader}`
            });

        } catch (err) {
            console.error('[song]', err.message, err.stderr || '');
            const m = `${err.message} ${err.stderr || ""}`;
            const friendly = m.includes('too long')
                ? `❌ Audio is too long (max 15 minutes).`
                : m.includes('unavailable')
                ? `❌ Video is unavailable or age-restricted.`
                : m.includes('blocked all client')
                ? `❌ YouTube blocked the request. Try again later.`
                : global.mess.error;
            if (wait) await sock.sendMessage(jid, { text: friendly, edit: wait.key });
            else await send(sock, jid, friendly);
        }
    }
};
