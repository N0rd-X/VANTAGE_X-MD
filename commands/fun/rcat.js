const config = require('../../config');
const axios = require('axios');

module.exports = {
    name: 'rcat',
    aliases: ['randomcat', 'meow'],
    category: 'fun',
    description: 'Get a random cat picture',
    usage: `${config.prefix}rcat`,
    
    async execute(sock, msg, args) {
        try {
            const jid = msg.key.remoteJid;
            const res = await axios.get('https://api.thecatapi.com/v1/images/search');
            const url = res.data[0]?.url;
            
            await sock.sendMessage(jid, {
                image: { url },
                caption: '🐱 Random Cat'
            });
        } catch (error) {
            console.error('RCat error:', error.message);
            await sock.sendMessage(msg.key.remoteJid, { text: global.mess.error });
        }
    }
};