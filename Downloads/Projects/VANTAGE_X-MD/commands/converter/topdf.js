const config = require('../../config');
const { downloadMediaMessage } = require('@whiskeysockets/baileys');
const fs = require('fs').promises;
const path = require('path');
const { exec } = require('child_process');
const { promisify } = require('util');
const execPromise = promisify(exec);

module.exports = {
    name: 'topdf',
    aliases: ['pdf', 'img2pdf'],
    category: 'converter',
    description: 'Convert image to PDF',
    weight: 'heavy'
    usage: `${config.prefix}topdf (reply to image)`,
    
    async execute(sock, msg, args) {
        try {
            const jid = msg.key.remoteJid;
            const quoted = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
            
            if (!quoted?.imageMessage) {
                return await sock.sendMessage(jid, { text: `❌ Reply to an image with ${config.prefix}topdf` });
            }
            
            const wait = await sock.sendMessage(jid, { text: '📄 Converting to PDF...' });
            
            const quotedMsg = {
                key: {
                    remoteJid: jid,
                    id: msg.message.extendedTextMessage.contextInfo.stanzaId,
                    participant: msg.message.extendedTextMessage.contextInfo.participant
                },
                message: quoted
            };
            
            const buffer = await downloadMediaMessage(quotedMsg, 'buffer', {});
            const tempFile = path.join('/tmp', `pdf_${Date.now()}.jpg`);
            const outFile = path.join('/tmp', `output_${Date.now()}.pdf`);
            
            await fs.writeFile(tempFile, buffer);
            await execPromise(`img2pdf ${tempFile} -o ${outFile}`);
            
            const outBuffer = await fs.readFile(outFile);
            await sock.sendMessage(jid, { delete: wait.key });
            
            await sock.sendMessage(jid, {
                document: outBuffer,
                mimetype: 'application/pdf',
                fileName: 'converted.pdf'
            });
            
            await fs.unlink(tempFile).catch(() => {});
            await fs.unlink(outFile).catch(() => {});
        } catch (error) {
            console.error('ToPDF error:', error.message);
            await sock.sendMessage(msg.key.remoteJid, { text: '❌ Failed. Is img2pdf installed?' });
        }
    }
};