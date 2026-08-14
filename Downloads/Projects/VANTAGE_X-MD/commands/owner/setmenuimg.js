const config = require('../../config');
const { downloadMediaMessage } = require('@whiskeysockets/baileys');
const fs = require('fs').promises;
const path = require('path');

module.exports = {
    name: 'setmenuimg',
    aliases: ['menuimg', 'setmenu'],
    category: 'owner',
    description: 'Set menu background image',
    usage: `${config.prefix}setmenuimg (reply to image)`,
    ownerOnly: true,
    
    async execute(sock, msg, args) {
        try {
            const jid = msg.key.remoteJid;
            const sender = msg.key.participant || msg.key.remoteJid;
            const ownerJid = `${config.ownernumber}@s.whatsapp.net`;
            
            if (sender !== ownerJid) return await sock.sendMessage(jid, { text: '⛔ Owner only.' });
            
            const quoted = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
            if (!quoted?.imageMessage) {
                return await sock.sendMessage(jid, { text: `❌ Reply to an image with ${config.prefix}setmenuimg` });
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
            const imgPath = path.join(__dirname, '../../media/menu.jpg');
            
            await fs.writeFile(imgPath, buffer);
            await sock.sendMessage(jid, { text: '✅ Menu image updated.' });
        } catch (error) {
            console.error('SetMenuImg error:', error.message);
            await sock.sendMessage(msg.key.remoteJid, { text: global.mess.error });
        }
    }
};