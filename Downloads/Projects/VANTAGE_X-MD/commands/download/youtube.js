'use strict';
const config  = require('../../config');
const { send } = require('../../helpers');
const { ytdlp } = require('../../lib/ytdlp');

module.exports = {
    name: 'youtube',
    aliases: ['yt', 'ytdl', 'ytaudio'],
    category: 'download',
    description: 'Download YouTube audio (mp3)',
    weight: 'heavy',
    usage: `${config.prefix}youtube <search query or URL>`,

    async execute(sock, msg, args) {
        const jid = msg.key.remoteJid;
        try {
            if (!args[0]) {
                return await send(sock, jid,
                    `❌ Usage: ${this.usage}\n\n` +
                    `Examples:\n${config.prefix}youtube Never Gonna Give You Up\n` +
                    `${config.prefix}youtube https://youtu.be/dQw4w9WgXcQ`
                );
            }

            const query = args.join(' ');
            const wait  = await sock.sendMessage(jid, { text: '🎵 Fetching audio…' });

            const result = await ytdlp(query, {
                type:    'audio',
                maxSecs: 900,    // 15-minute cap for audio
                format:  'mp3'
            });

            await sock.sendMessage(jid, { delete: wait.key });

            await sock.sendMessage(jid, {
                audio:    result.buffer,
                mimetype: 'audio/mpeg',
                fileName: `${result.title}.mp3`,
                ptt:      false
            }, { quoted: msg });

            // Send title as a follow-up text so user knows what they got
            await sock.sendMessage(jid, {
                text: `🎵 *${result.title}*\n⏱ ${result.duration} · 🎤 ${result.uploader}`
            });

        } catch (err) {
            console.error('[youtube]', err.message);
            const friendly = err.message.includes('too long')
                ? `❌ Audio is too long (max 15 minutes).`
                : err.message.includes('unavailable')
                ? `❌ Video is unavailable or age-restricted.`
                : global.mess.error;
            await sock.sendMessage(jid, { text: friendly });
        }
    }
};
