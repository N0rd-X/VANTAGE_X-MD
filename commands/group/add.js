const config = require('../../config');

module.exports = {
    name: 'add',
    aliases: ['invite'],
    category: 'group',
    description: 'Add a member to the group',
    usage: `${config.prefix}add <number>`,
    
    async execute(sock, msg, args) {
        try {
            const jid = msg.key.remoteJid;
            if (!jid.endsWith('@g.us')) {
                return await sock.sendMessage(jid, { text: global.mess.group });
            }
            
            const groupMeta = await sock.groupMetadata(jid);
            const sender = msg.key.participant || msg.key.remoteJid;
            const botId = sock.user.id.replace(/:\d+/, '') + '@s.whatsapp.net';
            
            const senderIsAdmin = groupMeta.participants.find(p => p.id === sender)?.admin;
            const botIsAdmin = groupMeta.participants.find(p => p.id === botId)?.admin;
            
            if (!senderIsAdmin) return await sock.sendMessage(jid, { text: global.mess.admin });
            if (!botIsAdmin) return await sock.sendMessage(jid, { text: global.mess.botAdmin });
            
            if (!args[0]) {
                return await sock.sendMessage(jid, { text: `❌ Usage: ${this.usage}\n\nExample: ${config.prefix}add 1234567890` });
            }
            
            const number = args[0].replace(/[^0-9]/g, '');
            const target = number + '@s.whatsapp.net';
            
            await sock.groupParticipantsUpdate(jid, [target], 'add');
            await sock.sendMessage(jid, {
                text: `✅ Added @${number} to the group.`,
                mentions: [target]
            });
        } catch (error) {
            console.error('Add error:', error.message);
            await sock.sendMessage(msg.key.remoteJid, { text: '❌ Failed to add user. They may have privacy settings enabled.' });
        }
    }
};