const config = require('../../config');

module.exports = {
    name: 'settings',
    aliases: ['config', 'botsettings'],
    category: 'owner',
    description: 'View bot settings',
    usage: `${config.prefix}settings`,
    ownerOnly: true,
    
    async execute(sock, msg, args) {
        try {
            const jid = msg.key.remoteJid;
            const sender = msg.key.participant || msg.key.remoteJid;
            const ownerJid = `${config.ownernumber}@s.whatsapp.net`;
            
            if (sender !== ownerJid) return await sock.sendMessage(jid, { text: '⛔ Owner only.' });
            
            const text = `⚙️ *Bot Settings*\n\n` +
                         `*Prefix:* ${config.prefix}\n` +
                         `*Bot Name:* ${config.botname || 'VANTAGE-X'}\n` +
                         `*Owner:* ${config.ownernumber}\n` +
                         `*Mode:* ${config.mode || 'public'}\n` +
                         `*Version:* 0.0.1.1-alpha`;
            
            await sock.sendMessage(jid, { text });
        } catch (error) {
            console.error('Settings error:', error.message);
            await sock.sendMessage(msg.key.remoteJid, { text: global.mess.error });
        }
    }
};