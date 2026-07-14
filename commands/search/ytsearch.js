'use strict';
const config   = require('../../config');
const { execFile } = require('child_process');
const { promisify } = require('util');

const execFileAsync = promisify(execFile);

module.exports = {
    name: 'ytsearch',
    aliases: ['yts', 'youtubesearch'],
    category: 'search',
    description: 'Search YouTube videos',
    usage: `${config.prefix}ytsearch <query>`,

    async execute(sock, msg, args) {
        const jid = msg.key.remoteJid;
        try {
            if (!args[0]) {
                return await sock.sendMessage(jid, {
                    text: `❌ Usage: ${this.usage}\n\nExample: ${config.prefix}ytsearch lofi hip hop`
                });
            }

            const query = args.join(' ');
            const wait  = await sock.sendMessage(jid, { text: '🔍 Searching YouTube…' });

            const { stdout } = await execFileAsync('yt-dlp', [
                '--dump-json',
                '--flat-playlist',
                '--quiet',
                '--no-warnings',
                '--playlist-end', '5',
                `ytsearch5:${query}`
            ], { timeout: 20_000 });

            const videos = stdout.trim().split('\n')
                .filter(Boolean)
                .map(line => { try { return JSON.parse(line); } catch { return null; } })
                .filter(Boolean);

            if (!videos.length) {
                return await sock.sendMessage(jid, {
                    text: '❌ No results found.',
                    edit: wait.key
                });
            }

            const fmt = (secs) => {
                if (!secs) return 'N/A';
                const m = Math.floor(secs / 60);
                const s = String(secs % 60).padStart(2, '0');
                return `${m}:${s}`;
            };

            let text = `🎬 *YouTube: ${query}*\n\n`;
            videos.forEach((v, i) => {
                text += `${i + 1}. *${v.title}*\n` +
                        `👤 ${v.channel || v.uploader || 'Unknown'}\n` +
                        `⏱ ${fmt(v.duration)}  ·  👁 ${v.view_count ? v.view_count.toLocaleString() + ' views' : 'N/A'}\n` +
                        `🔗 https://youtu.be/${v.id}\n\n`;
            });

            await sock.sendMessage(jid, { text: text.trim(), edit: wait.key });

        } catch (err) {
            console.error('[ytsearch]', err.message);
            await sock.sendMessage(jid, { text: global.mess.error });
        }
    }
};