'use strict';

const config                 = require('../../config');
const os                     = require('os');
const { send }               = require('../../helpers');
const { card }               = require('../../lib/messageStyle');

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
            const d = Math.floor(totalSecs / 86400);
            const h = Math.floor((totalSecs % 86400) / 3600);
            const m = Math.floor((totalSecs % 3600)  / 60);
            const s = totalSecs % 60;

            const memMB   = (process.memoryUsage().heapUsed / 1024 / 1024).toFixed(1);
            const loadAvg = os.loadavg()[0].toFixed(2);

            await sock.sendMessage(jid, {
                text: card('⏱️【 ʀᴜɴᴛɪᴍᴇ 】', [
                    `🕐 *Uptime:*  ${d}d ${h}h ${m}m ${s}s`,
                    `💾 *Memory:*  ${memMB} MB`,
                    `📟 *Load:*    ${loadAvg}`,
                    `⚙️ *Node:*    ${process.version}`,
                    `🏷️ *Build:*   v${config.version}`,
                ]),
            }, { quoted: msg });

        } catch (err) {
            console.error('[uptime]', err.message);
            await send(sock, jid, global.mess.error);
        }
    }
};
