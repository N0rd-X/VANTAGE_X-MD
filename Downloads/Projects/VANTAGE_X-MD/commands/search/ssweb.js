const config = require('../../config');

module.exports = {
    name: 'ssweb',
    aliases: ['screenshot', 'webss'],
    category: 'search',
    description: 'Take a screenshot of a website',
    weight: 'heavy'
    usage: `${config.prefix}ssweb <url>`,
    
    async execute(sock, msg, args) {
        try {
            const jid = msg.key.remoteJid;
            if (!args[0]) {
                return await sock.sendMessage(jid, {
                    text: `❌ Usage: ${this.usage}\n\nExample: ${config.prefix}ssweb https://google.com`
                });
            }
            
            let url = args[0];
            if (!url.startsWith('http')) url = 'https://' + url;
            
            const ssUrl = `https://api.apiflash.com/v1/urltoimage?access_key=YOUR_KEY&url=${encodeURIComponent(url)}&format=jpeg&width=1280&height=720`;
            const freeUrl = `https://image.thum.io/get/width/1200/crop/800/${url}`;
            
            await sock.sendMessage(jid, {
                image: { url: freeUrl },
                caption: `🌐 Screenshot of ${url}`
            });
        } catch (error) {
            console.error('SSWeb error:', error.message);
            await sock.sendMessage(msg.key.remoteJid, { text: global.mess.error });
        }
    }
};