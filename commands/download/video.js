'use strict';

const config    = require('../../config');
const { send }  = require('../../helpers');
const { ytdlp } = require('../../lib/ytdlp');

module.exports = {
    name: 'video',
    aliases: ['mp4', 'vid', 'dlvid'],
    category: 'download',
    description: 'Download a video from any supported platform',
    weight: 'heavy',
    usage: `${config.prefix}video <URL or search query>`,

    async execute(sock, msg, args) {
        const jid = msg.key.remoteJid;
        let wait;
        try {
            if (!args[0]) return await send(sock, jid, `❌ Usage: ${this.usage}`);

            const query = args.join(' ');

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
            console.error('[video]', err.message);
            const m = err.message;
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
