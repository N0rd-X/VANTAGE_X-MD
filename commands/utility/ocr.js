const config = require('../../config');
const { downloadMediaMessage } = require('@whiskeysockets/baileys');
const fs = require('fs').promises;
const path = require('path');
const { exec } = require('child_process');
const { promisify } = require('util');
const execPromise = promisify(exec);

module.exports = {
    name: 'ocr',
    aliases: ['readtext'],
    category: 'utility',
    description: 'Extract text from image (OCR)',
    usage: `${config.prefix}ocr (reply to image)`,
    
    async execute(sock, msg, args) {
        try {
            const jid = msg.key.remoteJid;
            const quoted = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
            
            if (!quoted?.imageMessage) {
                return await sock.sendMessage(jid, { text: `❌ Reply to an image with ${config.prefix}ocr` });
            }
            
            const wait = await sock.sendMessage(jid, { text: '📝 Reading text...' });
            
            const quotedMsg = {
                key: {
                    remoteJid: jid,
                    id: msg.message.extendedTextMessage.contextInfo.stanzaId,
                    participant: msg.message.extendedTextMessage.contextInfo.participant
                },
                message: quoted
            };
            
            const buffer = await downloadMediaMessage(quotedMsg, 'buffer', {});
            const tempFile = path.join('/tmp', `ocr_${Date.now()}.jpg`);
            await fs.writeFile(tempFile, buffer);
            
            try {
                const { stdout } = await execPromise(`tesseract ${tempFile} stdout`);
                await sock.sendMessage(jid, {
                    text: `📝 *OCR Result:*\n\n${stdout || 'No text detected.'}`,
                    edit: wait.key
                });
            } catch (e) {
                await sock.sendMessage(jid, {
                    text: `❌ OCR requires tesseract-ocr.\nInstall: apt-get install tesseract-ocr`,
                    edit: wait.key
                });
            }
            
            await fs.unlink(tempFile).catch(() => {});
        } catch (error) {
            console.error('OCR error:', error.message);
            await sock.sendMessage(msg.key.remoteJid, { text: global.mess.error });
        }
    }
};