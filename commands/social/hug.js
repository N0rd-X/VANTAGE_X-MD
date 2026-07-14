const config = require('../../config');
const axios = require('axios');

module.exports = {
    name: 'hug',
    aliases: ['hugs'],
    category: 'social',
    description: 'Hug someone',
    usage: `${config.prefix}hug @user`,
    
    async execute(sock, msg, args) {
        try {
            const jid = msg.key.remoteJid;
            const sender = msg.key.participant || msg.key.remoteJid;
            
            const mentionedJids = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid || [];
            
            if (mentionedJids.length === 0) {
                return await sock.sendMessage(jid, {
                    text: `❌ Usage: ${this.usage}\n\nMention someone to hug!`
                });
            }
            
            const target = mentionedJids[0];
            
            try {
                const response = await axios.get('https://api.waifu.pics/sfw/hug');
                const gifUrl = response.data.url;
                
                const senderName = sender.split('@')[0];
                const targetName = target.split('@')[0];
                
                await sock.sendMessage(jid, {
                    video: { url: gifUrl },
                    gifPlayback: true,
                    caption: `🤗 ${senderName} hugs ${targetName}!`,
                    mentions: [sender, target]
                });
                
            } catch (apiError) {
                // Fallback without GIF
                const senderName = sender.split('@')[0];
                const targetName = target.split('@')[0];
                
                await sock.sendMessage(jid, {
                    text: `🤗 ${senderName} hugs ${targetName}!`,
                    mentions: [sender, target]
                });
            }
            
        } catch (error) {
            console.error('Hug error:', error);
            await sock.sendMessage(msg.key.remoteJid, {
                text: '❌ Error sending hug'
            });
        }
    }
};