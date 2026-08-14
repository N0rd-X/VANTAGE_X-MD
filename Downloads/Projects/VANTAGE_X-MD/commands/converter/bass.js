const config = require('../../config');
const { downloadMediaMessage } = require('@whiskeysockets/baileys');
const fs = require('fs').promises;
const path = require('path');
const { exec } = require('child_process');
const { promisify } = require('util');
const execPromise = promisify(exec);

module.exports = {
    name: 'bass',
    aliases: ['bassboost'],
    category: 'converter',
    description: 'Bass boost audio',
    weight: 'heavy'
    usage: `${config.prefix}bass (reply to audio)`,
    
    async execute(sock, msg, args) {
        try {
            const jid = msg.key.remoteJid;
            const quoted = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
            
            if (!quoted?.audioMessage && !quoted?.videoMessage) {
                return await sock.sendMessage(jid, { text: `❌ Reply to an audio with ${config.prefix}bass` });
            }
            
            const wait = await sock.sendMessage(jid, { text: '🔊 Boosting bass...' });
            
            const quotedMsg = {
                key: {
                    remoteJid: jid,
                    id: msg.message.extendedTextMessage.contextInfo.stanzaId,
                    participant: msg.message.extendedTextMessage.contextInfo.participant
                },
                message: quoted
            };
            
            const buffer = await downloadMediaMessage(quotedMsg, 'buffer', {});
            const tempFile = path.join('/tmp', `audio_${Date.now()}.mp3`);
            const outFile = path.join('/tmp', `bass_${Date.now()}.mp3`);
            
            await fs.writeFile(tempFile, buffer);
            await execPromise(`ffmpeg -i ${tempFile} -af "bass=g=20" ${outFile}`);
            
            const audioBuffer = await fs.readFile(outFile);
            await sock.sendMessage(jid, {
                audio: audioBuffer,
                mimetype: 'audio/mpeg',
                fileName: 'bass_boosted.mp3'
            });
            
            await fs.unlink(tempFile).catch(() => {});
            await fs.unlink(outFile).catch(() => {});
        } catch (error) {
            console.error('Bass error:', error.message);
            await sock.sendMessage(msg.key.remoteJid, { text: '❌ Processing failed. Is ffmpeg installed?' });
        }
    }
};
