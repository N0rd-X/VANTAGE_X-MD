const config = require('../../config');

module.exports = {
    name: 'shutdown',
    aliases: ['poweroff', 'stop'],
    category: 'owner',
    description: 'Shutdown the bot',
    usage: `${config.prefix}shutdown`,
    ownerOnly: true,
    
    async execute(sock, msg, args) {
        try {
            const jid = msg.key.remoteJid;
            const sender = msg.key.participant || msg.key.remoteJid;
            const ownerJid = `${config.ownernumber}@s.whatsapp.net`;
            
            if (sender !== ownerJid) {
                return await sock.sendMessage(jid, { text: '⛔ Owner only.' });
            }
            
            await sock.sendMessage(jid, { text: '🛑 Shutting down...' });
            setTimeout(() => process.exit(0), 1000);
        } catch (error) {
            console.error('Shutdown error:', error.message);
            await sock.sendMessage(msg.key.remoteJid, { text: global.mess.error });
        }
    }
};