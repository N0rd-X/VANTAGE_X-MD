const config = require('../../config');

module.exports = {
    name: 'lovetest',
    aliases: ['love', 'ship'],
    category: 'fun',
    description: 'Test love compatibility',
    usage: `${config.prefix}lovetest @user`,
    
    async execute(sock, msg, args) {
        try {
            const jid = msg.key.remoteJid;
            const sender = msg.key.participant || msg.key.remoteJid;
            const mentioned = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid || [];
            
            if (!mentioned.length) {
                return await sock.sendMessage(jid, { text: `❌ Mention someone! ${this.usage}` });
            }
            
            const target = mentioned[0];
            const percent = Math.floor(Math.random() * 101);
            let emoji = percent > 80 ? '💕' : percent > 50 ? '💖' : percent > 20 ? '💔' : '☠️';
            
            await sock.sendMessage(jid, {
                text: `${emoji} *Love Test*\n\n@${sender.split('@')[0]} + @${target.split('@')[0]}\n\nCompatibility: ${percent}%\n\n${percent > 80 ? 'Soulmates!' : percent > 50 ? 'Good match!' : percent > 20 ? 'Maybe...' : 'Disaster!'}`,
                mentions: [sender, target]
            });
        } catch (error) {
            console.error('LoveTest error:', error.message);
            await sock.sendMessage(msg.key.remoteJid, { text: global.mess.error });
        }
    }
};