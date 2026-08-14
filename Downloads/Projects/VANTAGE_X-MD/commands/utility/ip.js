const config = require('../../config');
const axios = require('axios');

module.exports = {
    name: 'ip',
    aliases: ['ipinfo', 'iplookup'],
    category: 'utility',
    description: 'Lookup IP address info',
    usage: `${config.prefix}ip [address]`,
    
    async execute(sock, msg, args) {
        try {
            const jid = msg.key.remoteJid;
            const ip = args[0] || '';
            const url = ip ? `http://ip-api.com/json/${ip}` : 'http://ip-api.com/json/';
            
            const wait = await sock.sendMessage(jid, { text: '🔍 Fetching IP info...' });
            const res = await axios.get(url);
            const d = res.data;
            
            if (d.status === 'fail') {
                return await sock.sendMessage(jid, { text: `❌ ${d.message}`, edit: wait.key });
            }
            
            await sock.sendMessage(jid, {
                text: `🌐 *IP Info: ${d.query}*\n\n` +
                      `*Country:* ${d.country} (${d.countryCode})\n` +
                      `*Region:* ${d.regionName}\n` +
                      `*City:* ${d.city}\n` +
                      `*ZIP:* ${d.zip}\n` +
                      `*ISP:* ${d.isp}\n` +
                      `*Org:* ${d.org}\n` +
                      `*Timezone:* ${d.timezone}`,
                edit: wait.key
            });
        } catch (error) {
            console.error('IP error:', error.message);
            await sock.sendMessage(msg.key.remoteJid, { text: global.mess.error });
        }
    }
};