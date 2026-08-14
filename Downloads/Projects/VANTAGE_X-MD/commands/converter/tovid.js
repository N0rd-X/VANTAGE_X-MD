const config = require('../../config');
const { downloadMediaMessage } = require('@whiskeysockets/baileys');
const fs = require('fs').promises;
const path = require('path');
const { exec } = require('child_process');
const { promisify } = require('util');
const execPromise = promisify(exec);

module.exports = {
    name: 'tovid',
    aliases: ['tovideo'],
    category: 'converter',
    description: 'Convert GIF to video',
    weight: 'heavy'
    usage: `${config.prefix}tovid (reply to gif)`,
    
    async execute(sock, msg, args) {
        try {
            const jid = msg.key.remoteJid;
            const quoted = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
            
            if (!quoted?.videoMessage && !quoted?.stickerMessage) {
                return await sock.sendMessage(jid, { text: `❌ Reply to a GIF/sticker with ${config.prefix}tovid` });
            }
            
            const wait = await sock.sendMessage(jid, { text: '🎞️ Converting to video...' });
            
            const quotedMsg = {
                key: {
                    remoteJid: jid,
                    id: msg.message.extendedTextMessage.contextInfo.stanzaId,
                    participant: msg.message.extendedTextMessage.contextInfo.participant
                },
                message: quoted
            };
            
            const buffer = await downloadMediaMessage(quotedMsg, 'buffer', {});
            const tempFile = path.join('/tmp', `gif_${Date.now()}.gif`);
            const outFile = path.join('/tmp', `vid_${Date.now()}.mp4`);
            
            await fs.writeFile(tempFile, buffer);
            await execPromise(`ffmpeg -i ${tempFile} -movflags faststart -pix_fmt yuv420p -vf "scale=trunc(iw/2)*2:trunc(ih/2)*2" ${outFile}`);
            
            const outBuffer = await fs.readFile(outFile);
            await sock.sendMessage(jid, { delete: wait.key });
            
            await sock.sendMessage(jid, {
                video: outBuffer,
                caption: '🎞️ Converted to video'
            });
            
            await fs.unlink(tempFile).catch(() => {});
            await fs.unlink(outFile).catch(() => {});
        } catch (error) {
            console.error('ToVid error:', error.message);
            await sock.sendMessage(msg.key.remoteJid, { text: '❌ Failed. Is ffmpeg installed?' });
        }
    }
};