'use strict';

const config = require('../../config');
const { downloadMediaMessage } = require('@whiskeysockets/baileys');
const { send } = require('../../helpers');
const fs   = require('fs').promises;
const path = require('path');
const { execFile, execSync } = require('child_process');
const { promisify }  = require('util');

const execFileAsync = promisify(execFile);

// Check once at load time — avoids re-checking on every command call
let zbarAvailable = false;
try {
    execSync('which zbarimg', { stdio: 'ignore' });
    zbarAvailable = true;
} catch { zbarAvailable = false; }

module.exports = {
    name: 'readqr',
    aliases: ['qrread', 'decodeqr', 'scanqr'],
    category: 'utility',
    description: 'Read a QR code from an image',
    usage: `${config.prefix}readqr (reply to image)`,
    weight: 'heavy',

    async execute(sock, msg, args) {
        const jid = msg.key.remoteJid;
        try {
            if (!zbarAvailable) {
                return send(sock, jid,
                    `⚠️ *QR reader not available*\n\n` +
                    `This command needs \`zbar-tools\` installed on the host:\n\n` +
                    `*Termux:* \`pkg install zbar\`\n` +
                    `*Ubuntu/VPS:* \`sudo apt install zbar-tools\`\n` +
                    `*macOS:* \`brew install zbar\`\n\n` +
                    `After installing, restart the bot.`
                );
            }

            const ctx = msg.message?.extendedTextMessage?.contextInfo;
            const quoted = ctx?.quotedMessage;

            if (!quoted?.imageMessage) {
                return send(sock, jid, `❌ Reply to an image with ${config.prefix}readqr`);
            }

            const wait = await sock.sendMessage(jid, { text: '🔍 Scanning QR code…' });

            const fakeMsg = {
                key: {
                    remoteJid:   jid,
                    id:          ctx.stanzaId,
                    fromMe:      false,
                    participant: ctx.participant
                },
                message: quoted
            };

            const buffer   = await downloadMediaMessage(fakeMsg, 'buffer', {});
            const tempFile = path.join('/tmp', `qr_${Date.now()}.jpg`);
            await fs.writeFile(tempFile, buffer);

            let result;
            try {
                const { stdout } = await execFileAsync('zbarimg', ['-q', '--raw', tempFile], { timeout: 15_000 });
                result = stdout.trim();
            } finally {
                await fs.unlink(tempFile).catch(() => {});
            }

            if (!result) {
                return await sock.sendMessage(jid, {
                    text: '❌ No QR code detected in this image.',
                    edit: wait.key
                });
            }

            await sock.sendMessage(jid, {
                text: `📱 *QR Content*\n\n${result}`,
                edit: wait.key
            });

        } catch (err) {
            console.error('[readqr]', err.message);
            await send(sock, jid, global.mess.error);
        }
    }
};
