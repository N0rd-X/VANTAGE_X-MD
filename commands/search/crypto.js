const config = require('../../config');
const axios = require('axios');

module.exports = {
    name: 'crypto',
    aliases: ['coin', 'price'],
    category: 'search',
    description: 'Get crypto price',
    weight: 'heavy'
    usage: `${config.prefix}crypto <coin>`,
    async execute(sock, msg, args) {
        try {
            const jid = msg.key.remoteJid;
            if (!args[0]) return await sock.sendMessage(jid, { text: `❌ Usage: ${this.usage}` });
            const coin = args[0].toLowerCase();
            const wait = await sock.sendMessage(jid, { text: '💹 Fetching price...' });
            const res = await axios.get(`https://api.coingecko.com/api/v3/simple/price?ids=${coin}&vs_currencies=usd&include_24hr_change=true`);
            const data = res.data[coin];
            if (!data) return await sock.sendMessage(jid, { text: '❌ Coin not found. Try "bitcoin" or "ethereum".', edit: wait.key });
            const change = data.usd_24h_change;
            const emoji = change >= 0 ? '🟢' : '🔴';
            await sock.sendMessage(jid, { text: `💹 *${coin.toUpperCase()}*\n\n💵 $${data.usd}\n${emoji} 24h: ${change?.toFixed(2)}%`, edit: wait.key });
        } catch (e) { console.error(e.message); await sock.sendMessage(msg.key.remoteJid, { text: global.mess.error }); }
    }
};