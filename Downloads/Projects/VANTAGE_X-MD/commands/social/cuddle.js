const config = require('../../config');
const axios = require('axios');

module.exports = {
    name: 'cuddle',
    aliases: ['snuggle'],
    category: 'social',
    description: 'Cuddle someone',
    usage: `${config.prefix}cuddle @user`,
    
    async execute(sock, msg, args) {
        try {
            const jid = msg.key.remoteJid;
            const sender = msg.key.participant || msg.key.remoteJid;
            const mentioned = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid || [];
            
            if (!mentioned.length) {
                return await sock.sendMessage(jid, { text: `❌ Mention someone! ${this.usage}` });
            }
            
            const target = mentioned[0];
            const res = await axios.get('https://api.waifu.pics/sfw/cuddle');
            
            await sock.sendMessage(jid, {
                video: { url: res.data.url },
                gifPlayback: true,
                caption: `🤗 @${sender.split('@')[0]} cuddles @${target.split('@')[0]}!`,
                mentions: [sender, target]
            });
        } catch (error) {
            console.error('Cuddle error:', error.message);
            await sock.sendMessage(msg.key.remoteJid, { text: global.mess.error });
        }
    }
};