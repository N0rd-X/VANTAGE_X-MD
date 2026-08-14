const config = require('../../config');

module.exports = {
    name: 'alwaysonline',
    aliases: ['alwayson', 'online'],
    category: 'owner',
    description: 'Toggle always online status',
    weight: 'heavy'
    usage: `${config.prefix}alwaysonline <on|off>`,
    ownerOnly: true,
    
    async execute(sock, msg, args) {
        try {
            const jid = msg.key.remoteJid;
            const sender = msg.key.participant || msg.key.remoteJid;
            const ownerJid = `${config.ownernumber}@s.whatsapp.net`;
            
            if (sender !== ownerJid) return await sock.sendMessage(jid, { text: '⛔ Owner only.' });
            
            const action = args[0]?.toLowerCase();
            if (action === 'on') {
                await sock.sendPresenceUpdate('available', jid);
                await sock.sendMessage(jid, { text: '✅ Always online enabled.' });
            } else if (action === 'off') {
                await sock.sendPresenceUpdate('unavailable', jid);
                await sock.sendMessage(jid, { text: '✅ Always online disabled.' });
            } else {
                await sock.sendMessage(jid, { text: `❌ Usage: ${this.usage}` });
            }
        } catch (error) {
            console.error('AlwaysOnline error:', error.message);
            await sock.sendMessage(msg.key.remoteJid, { text: global.mess.error });
        }
    }
};