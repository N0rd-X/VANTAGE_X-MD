const config = require('../../config');
const axios = require('axios');

module.exports = {
    name: 'slap',
    aliases: ['smack'],
    category: 'social',
    description: 'Slap someone',
    usage: `${config.prefix}slap @user`,
    
    async execute(sock, msg, args) {
        try {
            const jid = msg.key.remoteJid;
            const sender = msg.key.participant || msg.key.remoteJid;
            
            const mentionedJids = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid || [];
            
            if (mentionedJids.length === 0) {
                return await sock.sendMessage(jid, {
                    text: `❌ Usage: ${this.usage}\n\nMention someone to slap!`
                });
            }
            
            const target = mentionedJids[0];
            
            try {
                const response = await axios.get('https://api.waifu.pics/sfw/slap');
                const gifUrl = response.data.url;
                
                const senderName = sender.split('@')[0];
                const targetName = target.split('@')[0];
                
                await sock.sendMessage(jid, {
                    video: { url: gifUrl },
                    gifPlayback: true,
                    caption: `👋 ${senderName} slaps ${targetName}!`,
                    mentions: [sender, target]
                });
                
            } catch (apiError) {
                const senderName = sender.split('@')[0];
                const targetName = target.split('@')[0];
                
                await sock.sendMessage(jid, {
                    text: `👋 ${senderName} slaps ${targetName}!`,
                    mentions: [sender, target]
                });
            }
            
        } catch (error) {
            console.error('Slap error:', error);
            await sock.sendMessage(msg.key.remoteJid, {
                text: '❌ Error sending slap'
            });
        }
    }
};