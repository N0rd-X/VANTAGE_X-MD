const config = require('../../config');
const { downloadMediaMessage } = require('@whiskeysockets/baileys');

module.exports = {
    name: 'setdp',
    aliases: ['setpp', 'setprofile'],
    category: 'owner',
    description: 'Set bot profile picture',
    usage: `${config.prefix}setdp (reply to image)`,
    ownerOnly: true,
    
    async execute(sock, msg, args) {
        try {
            const jid = msg.key.remoteJid;
            const sender = msg.key.participant || msg.key.remoteJid;
            const ownerJid = `${config.ownernumber}@s.whatsapp.net`;
            
            if (sender !== ownerJid) return await sock.sendMessage(jid, { text: '⛔ Owner only.' });
            
            const quoted = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
            if (!quoted?.imageMessage) {
                return await sock.sendMessage(jid, { text: `❌ Reply to an image with ${config.prefix}setdp` });
            }
            
            const quotedMsg = {
                key: {
                    remoteJid: jid,
                    id: msg.message.extendedTextMessage.contextInfo.stanzaId,
                    participant: msg.message.extendedTextMessage.contextInfo.participant
                },
                message: quoted
            };
            
            const buffer = await downloadMediaMessage(quotedMsg, 'buffer', {});
            await sock.updateProfilePicture(sock.user.id, buffer);
            
            await sock.sendMessage(jid, { text: '✅ Profile picture updated.' });
        } catch (error) {
            console.error('SetDP error:', error.message);
            await sock.sendMessage(msg.key.remoteJid, { text: global.mess.error });
        }
    }
};