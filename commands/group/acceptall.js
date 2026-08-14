const config = require('../../config');

module.exports = {
    name: 'acceptall',
    aliases: ['approveall'],
    category: 'group',
    description: 'Accept all pending join requests',
    usage: `${config.prefix}acceptall`,
    
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
            
            const requests = await sock.groupRequestParticipantsList(jid);
            if (!requests || !requests.length) {
                return await sock.sendMessage(jid, { text: '❌ No pending requests.' });
            }
            
            const jids = requests.map(r => r.jid);
            await sock.groupRequestParticipantsList(jid, jids, 'accept');
            
            await sock.sendMessage(jid, { text: `✅ Accepted ${jids.length} join requests.` });
        } catch (error) {
            console.error('AcceptAll error:', error.message);
            await sock.sendMessage(msg.key.remoteJid, { text: global.mess.error });
        }
    }
};