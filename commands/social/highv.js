const config = require('../../config');
const axios = require('axios');

module.exports = {
    name: 'highv',
    aliases: ['highfive', 'h5'],
    category: 'social',
    description: 'High five someone',
    usage: `${config.prefix}highv @user`,
    
    async execute(sock, msg, args) {
        try {
            const jid = msg.key.remoteJid;
            const sender = msg.key.participant || msg.key.remoteJid;
            const mentioned = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid || [];
            
            if (!mentioned.length) return await sock.sendMessage(jid, { text: `❌ Mention someone! ${this.usage}` });
            
            const target = mentioned[0];
            const res = await axios.get('https://api.waifu.pics/sfw/highfive');
            
            await sock.sendMessage(jid, {
                video: { url: res.data.url },
                gifPlayback: true,
                caption: `🙌 @${sender.split('@')[0]} high fives @${target.split('@')[0]}!`,
                mentions: [sender, target]
            });
        } catch (error) {
            console.error('HighV error:', error.message);
            await sock.sendMessage(msg.key.remoteJid, { text: global.mess.error });
        }
    }
};