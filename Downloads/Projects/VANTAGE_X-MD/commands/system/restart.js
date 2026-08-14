const config = require('../../config');

module.exports = {
    name: 'restart',
    aliases: ['reboot'],
    category: 'owner',
    description: 'Restart the bot',
    usage: `${config.prefix}restart`,
    ownerOnly: true,
    
    async execute(sock, msg, args) {
        try {
            const jid = msg.key.remoteJid;
            
            await sock.sendMessage(jid, {
                text: '🔄 Restarting bot...'
            });
            
            // Give time for message to send
            setTimeout(() => {
                process.exit(0); // PM2 or similar will auto-restart
            }, 1000);
            
        } catch (error) {
            console.error('Restart error:', error);
            await sock.sendMessage(msg.key.remoteJid, {
                text: '❌ Error restarting bot'
            });
        }
    }
};