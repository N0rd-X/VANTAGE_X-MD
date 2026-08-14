const config = require('../../config');
const axios = require('axios');

module.exports = {
    name: 'rlogo',
    aliases: ['randomlogo', 'logo'],
    category: 'fun',
    description: 'Generate a random logo-style text image',
    usage: `${config.prefix}rlogo <text>`,
    
    async execute(sock, msg, args) {
        try {
            const jid = msg.key.remoteJid;
            const text = args.join(' ') || 'VANTAGE-X';
            
            const url = `https://flamingtext.com/net-fu/proxy_form.cgi?imageoutput=true&script=chrome-logo&text=${encodeURIComponent(text)}`;
            
            await sock.sendMessage(jid, {
                image: { url },
                caption: `🎨 Logo for: ${text}`
            });
        } catch (error) {
            console.error('RLogo error:', error.message);
            await sock.sendMessage(msg.key.remoteJid, { text: global.mess.error });
        }
    }
};