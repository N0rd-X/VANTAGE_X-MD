const config = require('../../config');
const axios = require('axios');

module.exports = {
    name: 'wave',
    aliases: ['hello', 'hi'],
    category: 'social',
    description: 'Wave at someone',
    usage: `${config.prefix}wave @user`,
    
    async execute(sock, msg, args) {
        try {
            const jid = msg.key.remoteJid;
            const sender = msg.key.participant || msg.key.remoteJid;
            const mentioned = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid || [];
            
            const target = mentioned.length ? mentioned[0] : 'everyone';
            const res = await axios.get('https://api.waifu.pics/sfw/wave');
            const caption = mentioned.length 
                ? `👋 @${sender.split('@')[0]} waves at @${target.split('@')[0]}!`
                : `👋 @${sender.split('@')[0]} waves at everyone!`;
            
            await sock.sendMessage(jid, {
                video: { url: res.data.url },
                gifPlayback: true,
                caption,
                mentions: mentioned.length ? [sender, target] : [sender]
            });
        } catch (error) {
            console.error('Wave error:', error.message);
            await sock.sendMessage(msg.key.remoteJid, { text: global.mess.error });
        }
    }
};