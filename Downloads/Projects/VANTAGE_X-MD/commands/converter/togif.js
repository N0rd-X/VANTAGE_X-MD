const config = require('../../config');
const { downloadMediaMessage } = require('@whiskeysockets/baileys');
const fs = require('fs').promises;
const path = require('path');
const { exec } = require('child_process');
const { promisify } = require('util');
const execPromise = promisify(exec);

module.exports = {
    name: 'togif',
    aliases: ['gif'],
    category: 'converter',
    description: 'Convert video to GIF',
    weight: 'heavy'
    usage: `${config.prefix}togif (reply to video)`,
    
    async execute(sock, msg, args) {
        try {
            const jid = msg.key.remoteJid;
            const quoted = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
            
            if (!quoted?.videoMessage) {
                return await sock.sendMessage(jid, { text: `❌ Reply to a video with ${config.prefix}togif` });
            }
            
            const wait = await sock.sendMessage(jid, { text: '🎞️ Converting to GIF...' });
            
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
            const outFile = path.join('/tmp', `gif_${Date.now()}.gif`);
            
            await fs.writeFile(tempFile, buffer);
            await execPromise(`ffmpeg -i ${tempFile} -vf "fps=10,scale=480:-1:flags=lanczos" -t 7 ${outFile}`);
            
            const gifBuffer = await fs.readFile(outFile);
            await sock.sendMessage(jid, {
                video: gifBuffer,
                gifPlayback: true,
                caption: '🎞️ Converted to GIF'
            });
            
            await fs.unlink(tempFile).catch(() => {});
            await fs.unlink(outFile).catch(() => {});
        } catch (error) {
            console.error('ToGIF error:', error.message);
            await sock.sendMessage(msg.key.remoteJid, { text: '❌ Conversion failed. Is ffmpeg installed?' });
        }
    }
};