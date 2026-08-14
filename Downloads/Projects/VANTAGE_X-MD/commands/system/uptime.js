const config = require('../../config');

const START_TIME = Date.now();

function formatUptime(ms) {
    const totalSeconds = Math.floor(ms / 1000);
    const days    = Math.floor(totalSeconds / 86400);
    const hours   = Math.floor((totalSeconds % 86400) / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    const parts = [];
    if (days)    parts.push(`${days}d`);
    if (hours)   parts.push(`${hours}h`);
    if (minutes) parts.push(`${minutes}m`);
    parts.push(`${seconds}s`);

    return parts.join(' ');
}

module.exports = {
    name: 'uptime',
    aliases: ['runtime', 'ut'],
    category: 'utility',
    description: 'Show how long the bot has been running',
    usage: `${config.prefix}uptime`,

    async execute(sock, msg, args) {
        try {
            const jid = msg.key.remoteJid;
            const uptime = formatUptime(Date.now() - START_TIME);

            const memUsage = process.memoryUsage();
            const memMB = (memUsage.heapUsed / 1024 / 1024).toFixed(1);

            await sock.sendMessage(jid, {
                text: [
                    `⏱️ *VANTAGE-X MD — Runtime*`,
                    ``,
                    `🕐 Uptime    : ${uptime}`,
                    `💾 Memory   : ${memMB} MB`,
                    `📦 Version  : v${require('../../package.json').version}`,
                    `⚡ Node.js  : ${process.version}`
                ].join('\n')
            });

        } catch (error) {
            console.error('Uptime error:', error.message);
            await sock.sendMessage(msg.key.remoteJid, { text: global.mess.error });
        }
    }
};