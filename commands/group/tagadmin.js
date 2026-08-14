const config = require('../../config');

module.exports = {
    name: 'tagadmin',
    aliases: ['admins', 'mentionadmins'],
    category: 'utility',
    description: 'Tag all group admins',
    usage: `${config.prefix}tagadmin <message>`,
    
    async execute(sock, msg, args) {
        try {
            const jid = msg.key.remoteJid;
            if (!jid.endsWith('@g.us')) {
                return await sock.sendMessage(jid, { text: global.mess.group });
            }
            
            const groupMeta = await sock.groupMetadata(jid);
            const admins = groupMeta.participants.filter(p => p.admin).map(p => p.id);
            
            if (!admins.length) {
                return await sock.sendMessage(jid, { text: '❌ No admins found in this group.' });
            }
            
            const message = args.length ? args.join(' ') : '👑 Calling all admins!';
            
            await sock.sendMessage(jid, {
                text: message,
                mentions: admins
            });
        } catch (error) {
            console.error('Tagadmin error:', error.message);
            await sock.sendMessage(msg.key.remoteJid, { text: global.mess.error });
        }
    }
};