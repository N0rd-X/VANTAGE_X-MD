const config = require('../../config');
const axios = require('axios');

module.exports = {
    name: 'rcos',
    aliases: ['cosplay', 'randomcos'],
    category: 'fun',
    description: 'Get random cosplay picture',
    usage: `${config.prefix}rcos`,
    
    async execute(sock, msg, args) {
        try {
            const jid = msg.key.remoteJid;
            const res = await axios.get('https://api.waifu.pics/sfw/waifu');
            
            await sock.sendMessage(jid, {
                image: { url: res.data.url },
                caption: '👘 Random Cosplay'
            });
        } catch (error) {
            console.error('RCos error:', error.message);
            await sock.sendMessage(msg.key.remoteJid, { text: global.mess.error });
        }
    }
};