const messageStyle = require('../../lib/messageStyle');
const config = require('../../config');

module.exports = {
    name: 'alive',
    aliases: ['status', 'ping', 'bot'],
    category: 'utility',
    description: 'Check if bot is alive',
    usage: `${config.prefix}alive`,
    
    async execute(sock, msg, args) {
        try {
            const jid = msg.key.remoteJid;
            
            // Send fancy alive message with card styling
            await messageStyle.sendAliveMessage(sock, jid);
            
        } catch (error) {
            console.error('Alive command error:', error);
            // Fallback to simple text
            await sock.sendMessage(msg.key.remoteJid, {
                text: '✅ Bot is alive and running!'
            });
        }
    }
};