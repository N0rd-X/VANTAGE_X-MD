const config = require('../../config');
const { downloadMediaMessage } = require('@whiskeysockets/baileys');
const fs = require('fs').promises;
const path = require('path');
const { exec } = require('child_process');
const { promisify } = require('util');
const execPromise = promisify(exec);

module.exports = {
    name: 'slowmo',
    aliases: ['slow', 'slomo'],
    category: 'converter',
    description: 'Slow motion video',
    weight: 'heavy'
    usage: `${config.prefix}slowmo (reply to video)`,
    
    async execute(sock, msg, args) {
        try {
            const jid = msg.key.remoteJid;
            const quoted = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
            
            if (!quoted?.videoMessage) {
                return await sock.sendMessage(jid, { text: `❌ Reply to a video with ${config.prefix}slowmo` });
            }
            
            const wait = await sock.sendMessage(jid, { text: '🐌 Making slow motion...' });
            
            const quotedMsg = {
                key: {
                    remoteJid: jid,
                    id: msg.message.extendedTextMessage.contextInfo.stanzaId,
                    participant: msg.message.extendedTextMessage.contextInfo.participant
                },
                message: quoted
            };
            
            const buffer = await downloadMediaMessage(quotedMsg, 'buffer', {});
            const tempFile = path.join('/tmp', `slow_${Date.now()}.mp4`);
            const outFile = path.join('/tmp', `output_${Date.now()}.mp4`);
            
            await fs.writeFile(tempFile, buffer);
            await execPromise(`ffmpeg -i ${tempFile} -vf "setpts=2*PTS" -af "atempo=0.5" ${outFile}`);
            
            const outBuffer = await fs.readFile(outFile);
            await sock.sendMessage(jid, { delete: wait.key });
            
            await sock.sendMessage(jid, {
                video: outBuffer,
                caption: '🐌 Slow motion'
            });
            
            await fs.unlink(tempFile).catch(() => {});
            await fs.unlink(outFile).catch(() => {});
        } catch (error) {
            console.error('SlowMo error:', error.message);
            await sock.sendMessage(msg.key.remoteJid, { text: '❌ Failed. Is ffmpeg installed?' });
        }
    }
};