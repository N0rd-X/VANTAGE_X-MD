const config = require('../../config');
const { downloadMediaMessage } = require('@whiskeysockets/baileys');
const fs = require('fs').promises;
const path = require('path');
const { exec } = require('child_process');
const { promisify } = require('util');
const execPromise = promisify(exec);

module.exports = {
    name: 'readqr',
    aliases: ['qrread', 'decodeqr'],
    category: 'utility',
    description: 'Read a QR code from image',
    usage: `${config.prefix}readqr (reply to image)`,
    
    async execute(sock, msg, args) {
        try {
            const jid = msg.key.remoteJid;
            const quoted = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
            
            if (!quoted?.imageMessage) {
                return await sock.sendMessage(jid, { text: `❌ Reply to an image with ${config.prefix}readqr` });
            }
            
            const wait = await sock.sendMessage(jid, { text: '🔍 Reading QR...' });
            
            const quotedMsg = {
                key: {
                    remoteJid: jid,
                    id: msg.message.extendedTextMessage.contextInfo.stanzaId,
                    participant: msg.message.extendedTextMessage.contextInfo.participant
                },
                message: quoted
            };
            
            const buffer = await downloadMediaMessage(quotedMsg, 'buffer', {});
            const tempFile = path.join('/tmp', `qr_${Date.now()}.jpg`);
            await fs.writeFile(tempFile, buffer);
            
            try {
                const { stdout } = await execPromise(`zbarimg -q --raw ${tempFile}`);
                await sock.sendMessage(jid, {
                    text: `📱 *QR Content:*\n\n${stdout || 'No QR code found.'}`,
                    edit: wait.key
                });
            } catch (e) {
                await sock.sendMessage(jid, {
                    text: `❌ QR reading requires zbar-tools.\nInstall: apt-get install zbar-tools`,
                    edit: wait.key
                });
            }
            
            await fs.unlink(tempFile).catch(() => {});
        } catch (error) {
            console.error('ReadQR error:', error.message);
            await sock.sendMessage(msg.key.remoteJid, { text: global.mess.error });
        }
    }
};