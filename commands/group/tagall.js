const config = require('../../config');

module.exports = {
    name: 'tagall',
    aliases: ['mentionall', 'all'],
    category: 'group',
    description: 'Tag all group members',
    usage: `${config.prefix}tagall <message>`,
    
    async execute(sock, msg, args) {
        try {
            const jid = msg.key.remoteJid;
            if (!jid.endsWith('@g.us')) {
                return await sock.sendMessage(jid, { text: global.mess.group });
            }
            
            const groupMeta = await sock.groupMetadata(jid);
            const participants = groupMeta.participants.map(p => p.id);
            const message = args.length ? args.join(' ') : '👋 Attention everyone!';
            
            await sock.sendMessage(jid, {
                text: message,
                mentions: participants
            });
        } catch (error) {
            console.error('Tagall error:', error.message);
            await sock.sendMessage(msg.key.remoteJid, { text: global.mess.error });
        }
    }
};