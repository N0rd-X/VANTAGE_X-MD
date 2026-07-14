const config = require('../../config');
const axios = require('axios');

module.exports = {
    name: 'rwaifu',
    aliases: ['waifu', 'waifupic'],
    category: 'fun',
    description: 'Get a random waifu image',
    usage: `${config.prefix}rwaifu`,
    
    async execute(sock, msg, args) {
        try {
            const jid = msg.key.remoteJid;
            const res = await axios.get('https://api.waifu.pics/sfw/waifu');
            const url = res.data.url;
            
            await sock.sendMessage(jid, {
                image: { url },
                caption: '💖 Random Waifu'
            });
        } catch (error) {
            console.error('RWaifu error:', error.message);
            await sock.sendMessage(msg.key.remoteJid, { text: global.mess.error });
        }
    }
};