const config = require('../../config');
const axios = require('axios');

module.exports = {
    name: 'rdog',
    aliases: ['randomdog', 'woof'],
    category: 'fun',
    description: 'Get a random dog picture',
    usage: `${config.prefix}rdog`,
    
    async execute(sock, msg, args) {
        try {
            const jid = msg.key.remoteJid;
            const res = await axios.get('https://dog.ceo/api/breeds/image/random');
            const url = res.data?.message;
            
            await sock.sendMessage(jid, {
                image: { url },
                caption: '🐕 Random Dog'
            });
        } catch (error) {
            console.error('RDog error:', error.message);
            await sock.sendMessage(msg.key.remoteJid, { text: global.mess.error });
        }
    }
};