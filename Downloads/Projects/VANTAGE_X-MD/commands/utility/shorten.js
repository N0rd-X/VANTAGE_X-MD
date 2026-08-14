const config = require('../../config');
const axios = require('axios');

module.exports = {
    name: 'shorten',
    aliases: ['shorturl', 'tinyurl'],
    category: 'utility',
    description: 'Shorten a URL',
    weight: 'heavy'
    usage: `${config.prefix}shorten <url>`,
    
    async execute(sock, msg, args) {
        try {
            const jid = msg.key.remoteJid;
            if (!args[0]) {
                return await sock.sendMessage(jid, {
                    text: `❌ Usage: ${this.usage}\n\nExample: ${config.prefix}shorten https://google.com`
                });
            }
            
            const url = args[0];
            const res = await axios.get(`https://is.gd/create.php?format=json&url=${encodeURIComponent(url)}`);
            
            if (res.data.shorturl) {
                await sock.sendMessage(jid, {
                    text: `🔗 *URL Shortened*\n\nOriginal: ${url}\nShort: ${res.data.shorturl}`
                });
            } else {
                await sock.sendMessage(jid, { text: '❌ Failed to shorten URL.' });
            }
        } catch (error) {
            console.error('Shorten error:', error.message);
            await sock.sendMessage(msg.key.remoteJid, { text: global.mess.error });
        }
    }
};