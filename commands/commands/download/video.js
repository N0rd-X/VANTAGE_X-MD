'use strict';
const config  = require('../../config');
const { send } = require('../../helpers');
const { ytdlp } = require('../../lib/ytdlp');

module.exports = {
    name: 'video',
    aliases: ['vid', 'ytvid'],
    category: 'download',
    description: 'Download a YouTube video',
    weight: 'heavy',
    usage: `${config.prefix}video <search query or URL>`,

    async execute(sock, msg, args) {
        const jid = msg.key.remoteJid;
        try {
            if (!args[0]) return await send(sock, jid, `❌ Usage: ${this.usage}`);

            const query = args.join(' ');
            const wait  = await sock.sendMessage(jid, { text: '🔍 Searching…' });

            const result = await ytdlp(query, {
                type:    'video',
                maxSecs: 600,          // 10-minute cap
                format:  'mp4'
            });

            await sock.sendMessage(jid, { delete: wait.key });

            await sock.sendMessage(jid, {
                video:    result.buffer,
                caption:  `📹 *${result.title}*\n⏱ ${result.duration} · 👁 ${result.uploader}`,
                mimetype: 'video/mp4'
            }, { quoted: msg });

        } catch (err) {
            console.error('[video]', err.message);
            const friendly = err.message.includes('too long')
                ? `❌ Video is too long (max 10 minutes).`
                : err.message.includes('unavailable')
                ? `❌ Video is unavailable or age-restricted.`
                : global.mess.error;
            await sock.sendMessage(jid, { text: friendly });
        }
    }
};
