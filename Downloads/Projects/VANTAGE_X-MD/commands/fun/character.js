const config = require('../../config');
const axios = require('axios');

module.exports = {
    name: 'character',
    aliases: ['char', 'animechar'],
    category: 'fun',
    description: 'Get a random anime character',
    usage: `${config.prefix}character`,
    
    async execute(sock, msg, args) {
        try {
            const jid = msg.key.remoteJid;
            const res = await axios.get('https://api.jikan.moe/v4/random/characters');
            const char = res.data.data;
            
            await sock.sendMessage(jid, {
                image: { url: char.images?.jpg?.image_url || char.images?.webp?.image_url },
                caption: `👤 *${char.name}*\n\n${char.about ? char.about.substring(0, 500) + '...' : 'No description available.'}\n\n🔗 ${char.url}`
            });
        } catch (error) {
            console.error('Character error:', error.message);
            await sock.sendMessage(msg.key.remoteJid, { text: global.mess.error });
        }
    }
};