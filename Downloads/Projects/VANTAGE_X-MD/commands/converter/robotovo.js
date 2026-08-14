const config = require('../../config');
const { downloadMediaMessage } = require('@whiskeysockets/baileys');
const fs = require('fs').promises;
const path = require('path');
const { exec } = require('child_process');
const { promisify } = require('util');
const execPromise = promisify(exec);

module.exports = {
    name: 'robotvo',
    aliases: ['robot', 'robotvoice'],
    category: 'converter',
    description: 'Apply robot voice effect',
    weight: 'heavy'
    usage: `${config.prefix}robotvo (reply to audio)`,
    
    async execute(sock, msg, args) {
        try {
            const jid = msg.key.remoteJid;
            const quoted = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
            
            if (!quoted?.audioMessage && !quoted?.videoMessage) {
                return await sock.sendMessage(jid, { text: `❌ Reply to an audio with ${config.prefix}robotvo` });
            }
            
            const wait = await sock.sendMessage(jid, { text: '🤖 Robotizing voice...' });
            
            const quotedMsg = {
                key: {
                    remoteJid: jid,
                    id: msg.message.extendedTextMessage.contextInfo.stanzaId,
                    participant: msg.message.extendedTextMessage.contextInfo.participant
                },
                message: quoted
            };
            
            const buffer = await downloadMediaMessage(quotedMsg, 'buffer', {});
            const tempFile = path.join('/tmp', `rob_${Date.now()}.mp3`);
            const outFile = path.join('/tmp', `outr_${Date.now()}.mp3`);
            
            await fs.writeFile(tempFile, buffer);
            await execPromise(`ffmpeg -i ${tempFile} -af "asetrate=44100*0.8,aresample=44100,atempo=1.2,highpass=f=200,lowpass=f=3000" ${outFile}`);
            
            const outBuffer = await fs.readFile(outFile);
            await sock.sendMessage(jid, { delete: wait.key });
            
            await sock.sendMessage(jid, {
                audio: outBuffer,
                mimetype: 'audio/mpeg',
                ptt: true,
                fileName: 'robot.mp3'
            });
            
            await fs.unlink(tempFile).catch(() => {});
            await fs.unlink(outFile).catch(() => {});
        } catch (error) {
            console.error('RobotVo error:', error.message);
            await sock.sendMessage(msg.key.remoteJid, { text: '❌ Failed. Is ffmpeg installed?' });
        }
    }
};