'use strict';

const config    = require('../../config');
const { send }  = require('../../helpers');
const { ytdlp } = require('../../lib/ytdlp');

module.exports = {
    name: 'instagram',
    aliases: ['ig', 'insta', 'reel'],
    category: 'download',
    description: 'Download Instagram reels and posts',
    weight: 'heavy',
    usage: `${config.prefix}instagram <url>`,

    async execute(sock, msg, args) {
        const jid = msg.key.remoteJid;
        let wait;
        try {
            if (!args[0]) {
                return await send(sock, jid,
                    `❌ Usage: ${this.usage}\n\nExample: ${config.prefix}instagram https://instagram.com/reel/ABC123`
                );
            }

            const url = args[0];
            if (!url.includes('instagram.com')) {
                return await send(sock, jid, '❌ Invalid Instagram URL.');
            }

            wait = await sock.sendMessage(jid, { text: '⏳ Downloading Instagram content…' });

            const result = await ytdlp(url, { type: 'video', maxSecs: 300 });

            await sock.sendMessage(jid, {
                text: `✅ Found *${result.title || 'Instagram Reel'}* — sending…`,
                edit: wait.key
            });

            await sock.sendMessage(jid, {
                video:    result.buffer,
                caption:  `📸 *${result.title || 'Instagram Reel'}*\n> Downloaded by VANTAGE-X MD`,
                mimetype: 'video/mp4'
            }, { quoted: msg });

        } catch (err) {
            console.error('[instagram]', err.message, err.stderr || '');
            const m = `${err.message} ${err.stderr || ''}`;
            const friendly = m.includes('private') || m.includes('login')
                ? '❌ This post is private or requires login. Public reels only.'
                : m.includes('too long')
                ? '❌ Video is too long (max 5 minutes).'
                : '❌ Failed to download. Check the URL and try again.';
            if (wait) await sock.sendMessage(jid, { text: friendly, edit: wait.key });
            else await send(sock, jid, friendly);
        }
    }
};
