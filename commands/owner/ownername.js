const config = require('../../config');

module.exports = {
    name: 'ownername',
    aliases: ['setownername'],
    category: 'owner',
    description: 'Set owner display name',
    usage: `${config.prefix}ownername <name>`,
    ownerOnly: true,
    
    async execute(sock, msg, args) {
        try {
            const jid = msg.key.remoteJid;
            const sender = msg.key.participant || msg.key.remoteJid;
            const ownerJid = `${config.ownernumber}@s.whatsapp.net`;
            
            if (sender !== ownerJid) return await sock.sendMessage(jid, { text: '⛔ Owner only.' });
            if (!args[0]) return await sock.sendMessage(jid, { text: `❌ Usage: ${this.usage}` });
            
            const name = args.join(' ');
            config.ownername = name;
            
            await sock.sendMessage(jid, { text: `✅ Owner name set to: ${name}` });
        } catch (error) {
            console.error('OwnerName error:', error.message);
            await sock.sendMessage(msg.key.remoteJid, { text: global.mess.error });
        }
    }
};