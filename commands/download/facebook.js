'use strict';
const config  = require('../../config');
const { send } = require('../../helpers');
const { ytdlp } = require('../../lib/ytdlp');

module.exports = {
    name: 'facebook',
    aliases: ['fb', 'fbdl'],
    category: 'download',
    description: 'Download Facebook video',
    weight: 'heavy',
    usage: `${config.prefix}facebook <url>`,

    async execute(sock, msg, args) {
        const jid = msg.key.remoteJid;
        try {
            if (!args[0]) return await send(sock, jid, `❌ Usage: ${this.usage}`);

            const url = args[0];
            if (!url.includes('facebook.com') && !url.includes('fb.watch')) {
                return await send(sock, jid, '❌ Invalid Facebook URL.');
            }

            const wait = await sock.sendMessage(jid, { text: '⏳ Downloading Facebook video…' });

            const result = await ytdlp(url, { type: 'video', format: 'mp4', maxSecs: 600 });

            await sock.sendMessage(jid, { delete: wait.key });

            await sock.sendMessage(jid, {
                video:    result.buffer,
                caption:  `📘 *${result.title || 'Facebook Video'}*\n> Downloaded by VANTAGE-X MD`,
                mimetype: 'video/mp4'
            }, { quoted: msg });

        } catch (err) {
            console.error('[facebook]', err.message);
            const friendly = err.message.includes('private') || err.message.includes('login')
                ? '❌ This video is private or requires login.'
                : err.message.includes('too long')
                ? '❌ Video is too long (max 10 minutes).'
                : '❌ Failed to download. Check the URL and try again.';
            await sock.sendMessage(jid, { text: friendly });
        }
    }
};