const config = require('../../config');

module.exports = {
    name: 'unblock',
    aliases: ['unbanuser'],
    category: 'owner',
    description: 'Unblock a user',
    usage: `${config.prefix}unblock @user`,
    ownerOnly: true,
    
    async execute(sock, msg, args) {
        try {
            const jid = msg.key.remoteJid;
            const sender = msg.key.participant || msg.key.remoteJid;
            const ownerJid = `${config.ownernumber}@s.whatsapp.net`;
            
            if (sender !== ownerJid) {
                return await sock.sendMessage(jid, { text: '⛔ Owner only.' });
            }
            
            const mentioned = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid;
            const target = mentioned?.[0] || (args[0]?.replace(/[^0-9]/g, '') + '@s.whatsapp.net');
            
            if (!target) {
                return await sock.sendMessage(jid, { text: `❌ Usage: ${this.usage}` });
            }
            
            await sock.updateBlockStatus(target, 'unblock');
            await sock.sendMessage(jid, { text: `✅ Unblocked @${target.split('@')[0]}`, mentions: [target] });
        } catch (error) {
            console.error('Unblock error:', error.message);
            await sock.sendMessage(msg.key.remoteJid, { text: global.mess.error });
        }
    }
};