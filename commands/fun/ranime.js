const config = require('../../config');
const axios = require('axios');

module.exports = {
    name: 'ranime',
    aliases: ['animepic', 'anime'],
    category: 'fun',
    description: 'Get a random anime image',
    usage: `${config.prefix}ranime`,
    
    async execute(sock, msg, args) {
        try {
            const jid = msg.key.remoteJid;
            const res = await axios.get('https://api.waifu.pics/sfw/waifu');
            const url = res.data.url;
            
            await sock.sendMessage(jid, {
                image: { url },
                caption: '✨ Random Anime'
            });
        } catch (error) {
            console.error('RAnime error:', error.message);
            await sock.sendMessage(msg.key.remoteJid, { text: global.mess.error });
        }
    }
};