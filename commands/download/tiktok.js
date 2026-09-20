'use strict';

const config    = require('../../config');
const { send }  = require('../../helpers');
const { ytdlp } = require('../../lib/ytdlp');

module.exports = {
    name: 'tiktok',
    aliases: ['tt', 'tik'],
    category: 'download',
    description: 'Download TikTok video without watermark',
    weight: 'heavy',
    usage: `${config.prefix}tiktok <url>`,

    async execute(sock, msg, args) {
        const jid = msg.key.remoteJid;
        let wait;
        try {
            if (!args[0]) {
                return await send(sock, jid,
                    `❌ Usage: ${this.usage}\n\nExample: ${config.prefix}tiktok https://tiktok.com/@user/video/123`
                );
            }

            const url = args[0];
            if (!url.includes('tiktok.com') && !url.includes('vm.tiktok.com') && !url.includes('vt.tiktok.com')) {
                return await send(sock, jid, '❌ Invalid TikTok URL.');
            }

            wait = await sock.sendMessage(jid, { text: '⏳ Downloading TikTok video…' });

            const result = await ytdlp(url, { type: 'video', maxSecs: 300 });

            await sock.sendMessage(jid, {
                text: `✅ Found *${result.title || 'TikTok Video'}* — sending…`,
                edit: wait.key
            });

            await sock.sendMessage(jid, {
                video:    result.buffer,
                caption:  `🎵 *${result.title || 'TikTok Video'}*\n> Downloaded by VANTAGE-X MD`,
                mimetype: 'video/mp4'
            }, { quoted: msg });

        } catch (err) {
            console.error('[tiktok]', err.message, err.stderr || '');
            const m = `${err.message} ${err.stderr || ''}`;
            const friendly = m.includes('private')
                ? '❌ This video is private or unavailable.'
                : m.includes('too long')
                ? '❌ Video is too long (max 5 minutes).'
                : '❌ Failed to download. Check the URL and try again.';
            if (wait) await sock.sendMessage(jid, { text: friendly, edit: wait.key });
            else await send(sock, jid, friendly);
        }
    }
};
