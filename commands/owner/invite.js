const config = require('../../config');

module.exports = {
    name: 'invite',
    aliases: ['getinvite', 'grouplink'],
    category: 'owner',
    description: 'Get group invite link',
    usage: `${config.prefix}invite`,
    ownerOnly: true,
    
    async execute(sock, msg, args) {
        try {
            const jid = msg.key.remoteJid;
            if (await ownerGuard(sock, msg)) return;
            if (!jid.endsWith('@g.us')) return await sock.sendMessage(jid, { text: '❌ For groups only.' });
            
            const code = await sock.groupInviteCode(jid);
            await sock.sendMessage(jid, { text: `🔗 *Group Invite*\n\nhttps://chat.whatsapp.com/${code}` });
        } catch (error) {
            console.error('Invite error:', error.message);
            await sock.sendMessage(msg.key.remoteJid, { text: global.mess.error });
        }
    }
};