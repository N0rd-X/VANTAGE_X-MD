const config = require('../../config');
const { downloadMediaMessage } = require('@whiskeysockets/baileys');
const fs = require('fs').promises;
const path = require('path');
const { exec } = require('child_process');
const { promisify } = require('util');
const execPromise = promisify(exec);

module.exports = {
    name: 'raudio',
    aliases: ['reverseaudio', 'revaudio'],
    category: 'converter',
    description: 'Reverse audio',
    weight: 'heavy'
    usage: `${config.prefix}raudio (reply to audio)`,
    
    async execute(sock, msg, args) {
        try {
            const jid = msg.key.remoteJid;
            const quoted = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
            
            if (!quoted?.audioMessage && !quoted?.videoMessage) {
                return await sock.sendMessage(jid, { text: `❌ Reply to an audio with ${config.prefix}raudio` });
            }
            
            const wait = await sock.sendMessage(jid, { text: '🔃 Reversing audio...' });
            
            const quotedMsg = {
                key: {
                    remoteJid: jid,
                    id: msg.message.extendedTextMessage.contextInfo.stanzaId,
                    participant: msg.message.extendedTextMessage.contextInfo.participant
                },
                message: quoted
            };
            
            const buffer = await downloadMediaMessage(quotedMsg, 'buffer', {});
            const tempFile = path.join('/tmp', `rev_${Date.now()}.mp3`);
            const outFile = path.join('/tmp', `out_${Date.now()}.mp3`);
            
            await fs.writeFile(tempFile, buffer);
            await execPromise(`ffmpeg -i ${tempFile} -af "areverse" ${outFile}`);
            
            const outBuffer = await fs.readFile(outFile);
            await sock.sendMessage(jid, { delete: wait.key });
            
            await sock.sendMessage(jid, {
                audio: outBuffer,
                mimetype: 'audio/mpeg',
                fileName: 'reversed.mp3'
            });
            
            await fs.unlink(tempFile).catch(() => {});
            await fs.unlink(outFile).catch(() => {});
        } catch (error) {
            console.error('RAudio error:', error.message);
            await sock.sendMessage(msg.key.remoteJid, { text: '❌ Failed. Is ffmpeg installed?' });
        }
    }
};