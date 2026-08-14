const config = require('../../config');

module.exports = {
    name: 'reject',
    aliases: ['deny'],
    category: 'group',
    description: 'Reject a group join request',
    usage: `${config.prefix}reject @user`,
    
    async execute(sock, msg, args) {
        try {
            const jid = msg.key.remoteJid;
            if (!jid.endsWith('@g.us')) return await sock.sendMessage(jid, { text: global.mess.group });
            
            const groupMeta = await sock.groupMetadata(jid);
            const sender = msg.key.participant || msg.key.remoteJid;
            const botId = sock.user.id.replace(/:\d+/, '') + '@s.whatsapp.net';
            
            const senderIsAdmin = groupMeta.participants.find(p => p.id === sender)?.admin;
            const botIsAdmin = groupMeta.participants.find(p => p.id === botId)?.admin;
            
            if (!senderIsAdmin) return await sock.sendMessage(jid, { text: global.mess.admin });
            if (!botIsAdmin) return await sock.sendMessage(jid, { text: global.mess.botAdmin });
            
            const mentioned = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid;
            const target = mentioned?.[0] || (args[0]?.replace(/[^0-9]/g, '') + '@s.whatsapp.net');
            
            if (!target) return await sock.sendMessage(jid, { text: `❌ Usage: ${this.usage}` });
            
            await sock.groupRequestParticipantsList(jid, [target], 'reject');
            
            await sock.sendMessage(jid, {
                text: `❌ Rejected @${target.split('@')[0]}.`,
                mentions: [target]
            });
        } catch (error) {
            console.error('Reject error:', error.message);
            await sock.sendMessage(msg.key.remoteJid, { text: global.mess.error });
        }
    }
};