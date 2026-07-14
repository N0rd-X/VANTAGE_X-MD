const config = require('../../config');
const axios = require('axios');

module.exports = {
    name: 'rmeme',
    aliases: ['meme', 'randommeme'],
    category: 'fun',
    description: 'Get a random meme',
    usage: `${config.prefix}rmeme`,
    
    async execute(sock, msg, args) {
        try {
            const jid = msg.key.remoteJid;
            const res = await axios.get('https://meme-api.com/gimme');
            const meme = res.data;
            
            await sock.sendMessage(jid, {
                image: { url: meme.url },
                caption: `😂 *${meme.title}*\n👍 ${meme.ups} upvotes\n🔗 r/${meme.subreddit}`
            });
        } catch (error) {
            console.error('RMeme error:', error.message);
            await sock.sendMessage(msg.key.remoteJid, { text: global.mess.error });
        }
    }
};