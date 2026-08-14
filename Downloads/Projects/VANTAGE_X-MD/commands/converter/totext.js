const config = require('../../config');
const { downloadMediaMessage } = require('@whiskeysockets/baileys');
const fs = require('fs').promises;
const path = require('path');
const { exec } = require('child_process');
const { promisify } = require('util');
const execPromise = promisify(exec);

module.exports = {
    name: 'totext',
    aliases: ['ocr', 'img2txt'],
    category: 'converter',
    description: 'Extract text from image using OCR',
    weight: 'heavy'
    usage: `${config.prefix}totext (reply to image)`,
    
    async execute(sock, msg, args) {
        try {
            const jid = msg.key.remoteJid;
            const quoted = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
            
            if (!quoted?.imageMessage) {
                return await sock.sendMessage(jid, { text: `❌ Reply to an image with ${config.prefix}totext` });
            }
            
            const wait = await sock.sendMessage(jid, { text: '📝 Extracting text...' });
            
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
            
            // Using tesseract OCR
            try {
                const { stdout } = await execPromise(`tesseract ${tempFile} stdout`);
                await sock.sendMessage(jid, {
                    text: `📝 *Extracted Text:*\n\n${stdout || 'No text found.'}`,
                    edit: wait.key
                });
            } catch (ocrErr) {
                await sock.sendMessage(jid, {
                    text: `📝 OCR requires tesseract-ocr to be installed.\n\nInstall: apt-get install tesseract-ocr`,
                    edit: wait.key
                });
            }
            
            await fs.unlink(tempFile).catch(() => {});
        } catch (error) {
            console.error('ToText error:', error.message);
            await sock.sendMessage(msg.key.remoteJid, { text: global.mess.error });
        }
    }
};