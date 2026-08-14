const config = require('../../config');
const axios = require('axios');

module.exports = {
    name: 'rpic',
    aliases: ['randompic', 'pic'],
    category: 'fun',
    description: 'Get a random picture',
    usage: `${config.prefix}rpic`,
    
    async execute(sock, msg, args) {
        try {
            const jid = msg.key.remoteJid;
            const res = await axios.get('https://picsum.photos/800/600');
            
            await sock.sendMessage(jid, {
                image: { url: 'https://picsum.photos/800/600' },
                caption: '🖼️ Random Picture'
            });
        } catch (error) {
            console.error('RPic error:', error.message);
            await sock.sendMessage(msg.key.remoteJid, { text: global.mess.error });
        }
    }
};