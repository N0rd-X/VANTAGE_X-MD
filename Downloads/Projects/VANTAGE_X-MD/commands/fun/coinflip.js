const config = require('../../config');

module.exports = {
    name: 'coinflip',
    aliases: ['flip', 'coin'],
    category: 'fun',
    description: 'Flip a coin',
    usage: `${config.prefix}coinflip`,
    
    async execute(sock, msg, args) {
        try {
            const jid = msg.key.remoteJid;
            
            const result = Math.random() < 0.5 ? 'Heads' : 'Tails';
            const emoji = result === 'Heads' ? '🪙' : '💰';
            
            const flipMsg = await sock.sendMessage(jid, {
                text: '🔄 Flipping coin...'
            });
            
            await new Promise(resolve => setTimeout(resolve, 1500));
            
            await sock.sendMessage(jid, {
                text: `${emoji} **${result}!**`,
                edit: flipMsg.key
            });
            
        } catch (error) {
            console.error('Coinflip error:', error);
            await sock.sendMessage(msg.key.remoteJid, {
                text: '❌ Error flipping coin'
            });
        }
    }
};