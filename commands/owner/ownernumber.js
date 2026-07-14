const config = require('../../config');

module.exports = {
    name: 'ownernumber',
    aliases: ['owner', 'contact'],
    category: 'owner',
    description: 'Get owner contact info',
    usage: `${config.prefix}ownernumber`,
    ownerOnly: true,
    
    async execute(sock, msg, args) {
        try {
            const jid = msg.key.remoteJid;
            const sender = msg.key.participant || msg.key.remoteJid;
            const ownerJid = `${config.ownernumber}@s.whatsapp.net`;
            
            if (sender !== ownerJid) return await sock.sendMessage(jid, { text: '⛔ Owner only.' });
            
            await sock.sendMessage(jid, {
                text: `👑 *Owner Info*\n\nNumber: ${config.ownernumber}\nJID: ${ownerJid}`,
                contacts: {
                    displayName: 'Owner',
                    vcard: `BEGIN:VCARD\nVERSION:3.0\nFN:Owner\nTEL;waid=${config.ownernumber}:${config.ownernumber}\nEND:VCARD`
                }
            });
        } catch (error) {
            console.error('OwnerNumber error:', error.message);
            await sock.sendMessage(msg.key.remoteJid, { text: global.mess.error });
        }
    }
};
