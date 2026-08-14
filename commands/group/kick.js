const config = require('../../config');

module.exports = {
    name: 'kick',
    aliases: ['remove', 'ban'],
    category: 'group',
    description: 'Kick a member from the group',
    usage: `${config.prefix}kick @user`,
    
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
            
            const mentioned = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid;
            const target = mentioned?.[0] || (args[0]?.replace(/[^0-9]/g, '') + '@s.whatsapp.net');
            
            if (!target || target === botId) {
                return await sock.sendMessage(jid, { text: `❌ Usage: ${this.usage}` });
            }
            
            await sock.groupParticipantsUpdate(jid, [target], 'remove');
            await sock.sendMessage(jid, {
                text: `🚫 @${target.split('@')[0]} has been kicked.`,
                mentions: [target]
            });
        } catch (error) {
            console.error('Kick error:', error.message);
            await sock.sendMessage(msg.key.remoteJid, { text: global.mess.error });
        }
    }
};