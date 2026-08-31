'use strict';

const config   = require('../../config');
const { send } = require('../../helpers');

module.exports = {
    name: 'ping',
    aliases: ['speed', 'latency'],
    category: 'system',
    description: 'Check bot response time',
    usage: `${config.prefix}ping`,

    async execute(sock, msg, args) {
        const jid = msg.key.remoteJid;
        try {
            const start = Date.now();
            const sent  = await sock.sendMessage(jid, { text: '⌛' });
            const ms    = Date.now() - start;

            const bar   = ms < 100 ? '▓▓▓▓▓' : ms < 300 ? '▓▓▓░░' : ms < 600 ? '▓▓░░░' : '▓░░░░';
            const grade = ms < 100 ? 'excellent' : ms < 300 ? 'good' : ms < 600 ? 'fair' : 'slow';

            await sock.sendMessage(jid, {
                text:
                    `┏╾━━━━━━━━━━━━━━━━╼\n` +
                    `┃ 🏓【 ᴘᴏɴɢ 】\n` +
                    `┣╾━━━━━━━━━━━━━━━━╼\n` +
                    `┃ ⚡ *Latency:* ${ms}ms\n` +
                    `┃ 📶 *Signal:* ${bar}\n` +
                    `┃ 📊 *Grade:*  ${grade}\n` +
                    `┗╾━━━━━━━━━━━━━━━━╼`,
                edit: sent.key
            });

        } catch (err) {
            console.error('[ping]', err.message);
            await send(sock, jid, global.mess.error);
        }
    }
};
