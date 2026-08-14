const config = require('../../config');
const axios = require('axios');

module.exports = {
    name: 'whois',
    aliases: ['domaininfo', 'lookup'],
    category: 'utility',
    description: 'Lookup domain WHOIS info',
    usage: `${config.prefix}whois <domain>`,
    
    async execute(sock, msg, args) {
        try {
            const jid = msg.key.remoteJid;
            if (!args[0]) {
                return await sock.sendMessage(jid, {
                    text: `❌ Usage: ${this.usage}\n\nExample: ${config.prefix}whois google.com`
                });
            }
            
            const domain = args[0].replace(/https?:\/\//, '');
            const wait = await sock.sendMessage(jid, { text: '🔍 Looking up domain...' });
            
            const res = await axios.get(`https://api.whois.vu/?q=${domain}`);
            const data = res.data;
            
            await sock.sendMessage(jid, {
                text: `🌐 *WHOIS: ${domain}*\n\n` +
                      `*Registrar:* ${data.registrar || 'N/A'}\n` +
                      `*Created:* ${data.creation_date || 'N/A'}\n` +
                      `*Expires:* ${data.expiration_date || 'N/A'}\n` +
                      `*Nameservers:* ${data.name_servers?.join(', ') || 'N/A'}`,
                edit: wait.key
            });
        } catch (error) {
            console.error('Whois error:', error.message);
            await sock.sendMessage(msg.key.remoteJid, { text: global.mess.error });
        }
    }
};