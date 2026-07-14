const config = require('../../config');

module.exports = {
    name: 'yeet',
    aliases: ['throw'],
    category: 'social',
    description: 'Yeet someone into the sun',
    usage: `${config.prefix}yeet @user`,
    
    async execute(sock, msg, args) {
        try {
            const jid = msg.key.remoteJid;
            const sender = msg.key.participant || msg.key.remoteJid;
            const mentioned = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid || [];
            
            if (!mentioned.length) return await sock.sendMessage(jid, { text: `❌ Mention someone! ${this.usage}` });
            
            const target = mentioned[0];
            
            await sock.sendMessage(jid, {
                text: `🚀 @${sender.split('@')[0]} yeets @${target.split('@')[0]} into the stratosphere!`,
                mentions: [sender, target]
            });
        } catch (error) {
            console.error('Yeet error:', error.message);
            await sock.sendMessage(msg.key.remoteJid, { text: global.mess.error });
        }
    }
};