const config = require('../../config');
const axios = require('axios');

module.exports = {
    name: 'blush',
    aliases: ['blushes'],
    category: 'social',
    description: 'Blush at someone',
    usage: `${config.prefix}blush @user`,
    
    async execute(sock, msg, args) {
        try {
            const jid = msg.key.remoteJid;
            const sender = msg.key.participant || msg.key.remoteJid;
            const mentioned = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid || [];
            const target = mentioned.length ? mentioned[0] : null;
            
            const res = await axios.get('https://api.waifu.pics/sfw/blush');
            const caption = target
                ? `😳 @${sender.split('@')[0]} blushes at @${target.split('@')[0]}!`
                : `😳 @${sender.split('@')[0]} is blushing!`;
            
            await sock.sendMessage(jid, {
                video: { url: res.data.url },
                gifPlayback: true,
                caption,
                mentions: target ? [sender, target] : [sender]
            });
        } catch (error) {
            console.error('Blush error:', error.message);
            await sock.sendMessage(msg.key.remoteJid, { text: global.mess.error });
        }
    }
};