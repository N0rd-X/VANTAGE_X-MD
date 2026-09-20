'use strict';

const config    = require('../../config');
const { send }  = require('../../helpers');
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
        let wait;
        try {
            if (!args[0]) return await send(sock, jid, `❌ Usage: ${this.usage}`);

            const url = args[0];
            if (!url.includes('facebook.com') && !url.includes('fb.watch')) {
                return await send(sock, jid, '❌ Invalid Facebook URL.');
            }

            wait = await sock.sendMessage(jid, { text: '⏳ Downloading Facebook video…' });

            const result = await ytdlp(url, { type: 'video', maxSecs: 600 });

            await sock.sendMessage(jid, {
                text: `✅ Found *${result.title || 'Facebook Video'}* — sending…`,
                edit: wait.key
            });

            await sock.sendMessage(jid, {
                video:    result.buffer,
                caption:  `📘 *${result.title || 'Facebook Video'}*\n> Downloaded by VANTAGE-X MD`,
                mimetype: 'video/mp4'
            }, { quoted: msg });

        } catch (err) {
            console.error('[facebook]', err.message, err.stderr || '');
            const m = `${err.message} ${err.stderr || ''}`;
            const friendly = m.includes('private') || m.includes('login')
                ? '❌ This video is private or requires login.'
                : m.includes('too long')
                ? '❌ Video is too long (max 10 minutes).'
                : '❌ Failed to download. Check the URL and try again.';
            if (wait) await sock.sendMessage(jid, { text: friendly, edit: wait.key });
            else await send(sock, jid, friendly);
        }
    }
};
