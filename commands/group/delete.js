const config = require('../../config');

module.exports = {
    name: 'delete',
    aliases: ['del', 'd'],
    category: 'group',
    description: 'Delete a quoted message',
    usage: `${config.prefix}delete (reply to message)`,
    
    async execute(sock, msg, args) {
        try {
            const jid = msg.key.remoteJid;
            const quoted = msg.message?.extendedTextMessage?.contextInfo;
            
            if (!quoted) {
                return await sock.sendMessage(jid, { text: '❌ Reply to the message you want to delete.' });
            }
            
            const groupMeta = await sock.groupMetadata(jid);
            const sender = msg.key.participant || msg.key.remoteJid;
            const botId = sock.user.id.replace(/:\d+/, '') + '@s.whatsapp.net';
            
            const senderIsAdmin = groupMeta.participants.find(p => p.id === sender)?.admin;
            const botIsAdmin = groupMeta.participants.find(p => p.id === botId)?.admin;
            
            if (!senderIsAdmin) return await sock.sendMessage(jid, { text: global.mess.admin });
            if (!botIsAdmin) return await sock.sendMessage(jid, { text: global.mess.botAdmin });
            
            await sock.sendMessage(jid, {
                delete: {
                    remoteJid: jid,
                    fromMe: false,
                    id: quoted.stanzaId,
                    participant: quoted.participant
                }
            });
        } catch (error) {
            console.error('Delete error:', error.message);
            await sock.sendMessage(msg.key.remoteJid, { text: global.mess.error });
        }
    }
};