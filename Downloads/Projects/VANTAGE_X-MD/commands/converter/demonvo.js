const config = require('../../config');
const { downloadMediaMessage } = require('@whiskeysockets/baileys');
const fs = require('fs').promises;
const path = require('path');
const { exec } = require('child_process');
const { promisify } = require('util');
const execPromise = promisify(exec);

module.exports = {
    name: 'demonvo',
    aliases: ['demon', 'demonvoice', 'deep'],
    category: 'converter',
    description: 'Apply demon/deep voice effect',
    weight: 'heavy'
    usage: `${config.prefix}demonvo (reply to audio)`,
    
    async execute(sock, msg, args) {
        try {
            const jid = msg.key.remoteJid;
            const quoted = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
            
            if (!quoted?.audioMessage && !quoted?.videoMessage) {
                return await sock.sendMessage(jid, { text: `❌ Reply to an audio with ${config.prefix}demonvo` });
            }
            
            const wait = await sock.sendMessage(jid, { text: '👿 Demonizing voice...' });
            
            const quotedMsg = {
                key: {
                    remoteJid: jid,
                    id: msg.message.extendedTextMessage.contextInfo.stanzaId,
                    participant: msg.message.extendedTextMessage.contextInfo.participant
                },
                message: quoted
            };
            
            const buffer = await downloadMediaMessage(quotedMsg, 'buffer', {});
            const tempFile = path.join('/tmp', `dem_${Date.now()}.mp3`);
            const outFile = path.join('/tmp', `outd_${Date.now()}.mp3`);
            
            await fs.writeFile(tempFile, buffer);
            await execPromise(`ffmpeg -i ${tempFile} -af "asetrate=44100*0.6,aresample=44100,atempo=1.3,chorus=0.5:0.9:50|60|40:0.4|0.32|0.3:0.25|0.4|0.3:2|2.3|1.3" ${outFile}`);
            
            const outBuffer = await fs.readFile(outFile);
            await sock.sendMessage(jid, { delete: wait.key });
            
            await sock.sendMessage(jid, {
                audio: outBuffer,
                mimetype: 'audio/mpeg',
                ptt: true,
                fileName: 'demon.mp3'
            });
            
            await fs.unlink(tempFile).catch(() => {});
            await fs.unlink(outFile).catch(() => {});
        } catch (error) {
            console.error('DemonVo error:', error.message);
            await sock.sendMessage(msg.key.remoteJid, { text: '❌ Failed. Is ffmpeg installed?' });
        }
    }
};