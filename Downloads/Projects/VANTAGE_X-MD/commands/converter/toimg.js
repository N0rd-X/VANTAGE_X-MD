/**
 * TOIMG COMMAND - Convert sticker to image
 */

const config = require('../../config');
const { downloadMediaMessage } = require('@whiskeysockets/baileys');

module.exports = {
    name: 'toimg',
    aliases: ['stickertoimg', 'unpack', 'unsticker'],
    category: 'converter',
    description: 'Convert a sticker to an image',
    weight: 'heavy'
    usage: `${config.prefix}toimg (reply to a sticker)`,

    async execute(sock, msg, args) {
        try {
            const jid = msg.key.remoteJid;
            const quoted = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;

            if (!quoted?.stickerMessage) {
                return await sock.sendMessage(jid, {
                    text: `❌ Please reply to a sticker with ${this.usage}`
                });
            }

            const wait = await sock.sendMessage(jid, { text: '🔄 Converting sticker to image...' });

            // Reconstruct quoted message for download
            const quotedMsg = {
                key: {
                    remoteJid: jid,
                    id: msg.message.extendedTextMessage.contextInfo.stanzaId,
                    participant: msg.message.extendedTextMessage.contextInfo.participant
                },
                message: quoted
            };

            const buffer = await downloadMediaMessage(quotedMsg, 'buffer', {});

            await sock.sendMessage(jid, { delete: wait.key });

            await sock.sendMessage(jid, {
                image: buffer,
                caption: '🖼️ Here\'s your sticker as an image.'
            });

        } catch (error) {
            console.error('ToImg error:', error.message);
            await sock.sendMessage(msg.key.remoteJid, { text: global.mess.error });
        }
    }
};