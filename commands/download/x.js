'use strict';
const config  = require('../../config');
const { send } = require('../../helpers');
const { ytdlp } = require('../../lib/ytdlp');

module.exports = {
    name: 'x',
    aliases: ['twitter', 'xdl', 'tweet'],
    category: 'download',
    description: 'Download X/Twitter video',
    weight: 'heavy',
    usage: `${config.prefix}x <url>`,

    async execute(sock, msg, args) {
        const jid = msg.key.remoteJid;
        try {
            if (!args[0]) return await send(sock, jid, `❌ Usage: ${this.usage}`);

            const url = args[0];
            if (!url.includes('x.com') && !url.includes('twitter.com')) {
                return await send(sock, jid, '❌ Invalid X/Twitter URL.');
            }

            const wait = await sock.sendMessage(jid, { text: '⏳ Downloading X video…' });

            const result = await ytdlp(url, { type: 'video', format: 'mp4', maxSecs: 300 });

            await sock.sendMessage(jid, { delete: wait.key });

            await sock.sendMessage(jid, {
                video:    result.buffer,
                caption:  `𝕏 *${result.title || 'X Video'}*\n> Downloaded by VANTAGE-X MD`,
                mimetype: 'video/mp4'
            }, { quoted: msg });

        } catch (err) {
            console.error('[x]', err.message);
            const friendly = err.message.includes('private') || err.message.includes('login')
                ? '❌ This tweet is from a private account.'
                : err.message.includes('too long')
                ? '❌ Video is too long (max 5 minutes).'
                : '❌ Failed to download. Check the URL and try again.';
            await sock.sendMessage(jid, { text: friendly });
        }
    }
};
