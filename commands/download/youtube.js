'use strict';

const config    = require('../../config');
const { send }  = require('../../helpers');
const { ytdlp } = require('../../lib/ytdlp');

module.exports = {
    name: 'youtube',
    aliases: ['yt', 'ytv', 'ytmp4', 'ytvideo'],
    category: 'download',
    description: 'Download a YouTube video',
    weight: 'heavy',
    usage: `${config.prefix}youtube <search query or URL>`,

    async execute(sock, msg, args) {
        const jid = msg.key.remoteJid;
        let wait;
        try {
            if (!args[0]) {
                return await send(sock, jid,
                    `❌ Usage: ${this.usage}\n\n` +
                    `Examples:\n${config.prefix}youtube Never Gonna Give You Up\n` +
                    `${config.prefix}youtube https://youtu.be/dQw4w9WgXcQ`
                );
            }

            const query = args.join(' ');
            const isUrl = /^https?:\/\//i.test(query);

            if (isUrl && !/youtu\.?be|youtube\.com/i.test(query)) {
                return await send(sock, jid,
                    `❌ This command is YouTube only.\n` +
                    `Use *${config.prefix}video* to download from other platforms.`
                );
            }

            wait = await sock.sendMessage(jid, { text: '🎬 Fetching video…' });

            const result = await ytdlp(query, {
                type:    'video',
                maxSecs: 600,   // 10-minute cap
            });

            await sock.sendMessage(jid, {
                text: `✅ Found *${result.title}* — sending…`,
                edit: wait.key
            });

            await sock.sendMessage(jid, {
                video:    result.buffer,
                mimetype: 'video/mp4',
                caption:  `📹 *${result.title}*\n⏱ ${result.duration} · 📺 ${result.uploader}`,
            }, { quoted: msg });

        } catch (err) {
            console.error('[youtube]', err.message, err.stderr || '');
            const m = `${err.message} ${err.stderr || ""}`;
            const friendly = m.includes('too long')
                ? `❌ Video is too long (max 10 minutes).`
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
