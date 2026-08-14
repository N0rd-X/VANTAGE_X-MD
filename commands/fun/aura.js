const config = require('../../config');

module.exports = {
    name: 'aura',
    aliases: ['vibe'],
    category: 'fun',
    description: 'Check your aura percentage',
    usage: `${config.prefix}aura @user`,
    
    async execute(sock, msg, args) {
        try {
            const jid = msg.key.remoteJid;
            const sender = msg.key.participant || msg.key.remoteJid;
            const mentioned = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid || [];
            const target = mentioned[0] || sender;
            
            const aura = Math.floor(Math.random() * 101);
            let bar = '';
            for (let i = 0; i < 10; i++) bar += i < Math.floor(aura / 10) ? '█' : '░';
            
            await sock.sendMessage(jid, {
                text: `✨ *Aura Check*\n\n@${target.split('@')[0]}\n\n${bar} ${aura}%\n\n${aura > 80 ? 'Radiant!' : aura > 50 ? 'Decent.' : 'Dim...'}`,
                mentions: [target]
            });
        } catch (error) {
            console.error('Aura error:', error.message);
            await sock.sendMessage(msg.key.remoteJid, { text: global.mess.error });
        }
    }
};