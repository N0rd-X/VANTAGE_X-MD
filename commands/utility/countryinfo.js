const config = require('../../config');
const axios = require('axios');

module.exports = {
    name: 'countryinfo',
    aliases: ['country', 'nation'],
    category: 'utility',
    description: 'Get country information',
    usage: `${config.prefix}countryinfo <country>`,
    
    async execute(sock, msg, args) {
        try {
            const jid = msg.key.remoteJid;
            if (!args[0]) return await sock.sendMessage(jid, { text: `❌ Usage: ${this.usage}` });
            
            const country = args.join(' ');
            const wait = await sock.sendMessage(jid, { text: '🌍 Fetching country info...' });
            
            const res = await axios.get(`https://restcountries.com/v3.1/name/${encodeURIComponent(country)}`);
            const c = res.data[0];
            
            const text = `🌍 *${c.name.common}*\n\n` +
                         `*Capital:* ${c.capital?.[0] || 'N/A'}\n` +
                         `*Region:* ${c.region}\n` +
                         `*Population:* ${c.population.toLocaleString()}\n` +
                         `*Currency:* ${Object.values(c.currencies || {})[0]?.name || 'N/A'}\n` +
                         `*Language:* ${Object.values(c.languages || {}).join(', ')}\n` +
                         `*Flag:* ${c.flag}`;
            
            await sock.sendMessage(jid, { text, edit: wait.key });
        } catch (error) {
            console.error('CountryInfo error:', error.message);
            await sock.sendMessage(msg.key.remoteJid, { text: '❌ Country not found.' });
        }
    }
};