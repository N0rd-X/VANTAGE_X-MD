const config = require('../../config');

module.exports = {
    name: 'setdesc',
    aliases: ['setdescription'],
    category: 'owner',
    description: 'Set group description',
    usage: `${config.prefix}setdesc <text>`,
    ownerOnly: true,
    
    async execute(sock, msg, args) {
        try {
            const jid = msg.key.remoteJid;
            const sender = msg.key.participant || msg.key.remoteJid;
            const ownerJid = `${config.ownernumber}@s.whatsapp.net`;
            
            if (sender !== ownerJid) return await sock.sendMessage(jid, { text: '⛔ Owner only.' });
            if (!args[0]) return await sock.sendMessage(jid, { text: `❌ Usage: ${this.usage}` });
            
            const desc = args.join(' ');
            await sock.groupUpdateDescription(jid, desc);
            await sock.sendMessage(jid, { text: `✅ Group description updated.` });
        } catch (error) {
            console.error('SetDesc error:', error.message);
            await sock.sendMessage(msg.key.remoteJid, { text: global.mess.error });
        }
    }
};