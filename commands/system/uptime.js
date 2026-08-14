'use strict';

const config   = require('../../config');
const os       = require('os');
const { send } = require('../../helpers');

// Persists across hot-reloads — module cache holds the reference
global.BOT_START_TIME = global.BOT_START_TIME || Date.now();

module.exports = {
    name: 'uptime',
    aliases: ['runtime', 'ut'],
    category: 'system',
    description: 'Show how long the bot has been running',
    usage: `${config.prefix}uptime`,

    async execute(sock, msg, args) {
        const jid = msg.key.remoteJid;
        try {
            const totalSecs = Math.floor((Date.now() - global.BOT_START_TIME) / 1000);
            const d  = Math.floor(totalSecs / 86400);
            const h  = Math.floor((totalSecs % 86400) / 3600);
            const m  = Math.floor((totalSecs % 3600) / 60);
            const s  = totalSecs % 60;

            const memMB  = (process.memoryUsage().heapUsed / 1024 / 1024).toFixed(1);
            const loadAvg = os.loadavg()[0].toFixed(2);

            const text =
                `┏╾━━━━━━━━━━━━━━━━╼\n` +
                `┃ ⏱️【 ʀᴜɴᴛɪᴍᴇ 】\n` +
                `┣╾━━━━━━━━━━━━━━━━╼\n` +
                `┃\n` +
                `┃ 🕐 *Uptime:*  ${d}d ${h}h ${m}m ${s}s\n` +
                `┃ 💾 *Memory:* ${memMB} MB\n` +
                `┃ 📟 *Load:*   ${loadAvg}\n` +
                `┃ ⚙️ *Node:*   ${process.version}\n` +
                `┃ 🏷️ *Build:*  v${config.version || '0.0.0.7'}\n` +
                `┃\n` +
                `┗╾━━━━━━━━━━━━━━━━╼`;

            await sock.sendMessage(jid, { text }, { quoted: msg });

        } catch (err) {
            console.error('[uptime]', err.message);
            await send(sock, jid, global.mess.error);
        }
    }
};
