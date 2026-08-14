const config = require('../../config');
const { downloadMediaMessage } = require('@whiskeysockets/baileys');
const fs = require('fs').promises;
const path = require('path');
const { exec } = require('child_process');
const { promisify } = require('util');
const execPromise = promisify(exec);

module.exports = {
    name: 'tomp3',
    aliases: ['toaudio', 'mp3'],
    category: 'converter',
    description: 'Convert video to MP3',
    weight: 'heavy'
    usage: `${config.prefix}tomp3 (reply to video)`,
    
    async execute(sock, msg, args) {
        try {
            const jid = msg.key.remoteJid;
            const quoted = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
            
            if (!quoted?.videoMessage) {
                return await sock.sendMessage(jid, { text: `❌ Reply to a video with ${config.prefix}tomp3` });
            }
            
            const wait = await sock.sendMessage(jid, { text: '🎵 Converting to MP3...' });
            
            const quotedMsg = {
                key: {
                    remoteJid: jid,
                    id: msg.message.extendedTextMessage.contextInfo.stanzaId,
                    participant: msg.message.extendedTextMessage.contextInfo.participant
                },
                message: quoted
            };
            
            const buffer = await downloadMediaMessage(quotedMsg, 'buffer', {});
            const tempFile = path.join('/tmp', `vid_${Date.now()}.mp4`);
            const outFile = path.join('/tmp', `audio_${Date.now()}.mp3`);
            
            await fs.writeFile(tempFile, buffer);
            await execPromise(`ffmpeg -i ${tempFile} -vn -ar 44100 -ac 2 -b:a 192k ${outFile}`);
            
            const audioBuffer = await fs.readFile(outFile);
            await sock.sendMessage(jid, {
                audio: audioBuffer,
                mimetype: 'audio/mpeg',
                fileName: 'converted.mp3'
            });
            
            await fs.unlink(tempFile).catch(() => {});
            await fs.unlink(outFile).catch(() => {});
        } catch (error) {
            console.error('ToMP3 error:', error.message);
            await sock.sendMessage(msg.key.remoteJid, { text: '❌ Conversion failed. Is ffmpeg installed?' });
        }
    }
};