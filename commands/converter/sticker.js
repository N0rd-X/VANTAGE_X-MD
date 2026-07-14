/**
 * STICKER COMMAND - Convert image/video to sticker
 */

const config = require('../../config');
const { downloadMediaMessage } = require('@whiskeysockets/baileys');
const fs = require('fs').promises;
const path = require('path');
const { exec } = require('child_process');
const { promisify } = require('util');
const execPromise = promisify(exec);

module.exports = {
    name: 'sticker',
    aliases: ['s', 'stiker'],
    category: 'converter',
    description: 'Convert image/video to sticker',
    weight: 'heavy'
    usage: `${config.prefix}sticker (reply to image/video)`,
    
    async execute(sock, msg, args) {
        try {
            const jid = msg.key.remoteJid;
            
            // Check for quoted message with media
            const quotedMsg = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
            
            if (!quotedMsg) {
                return await sock.sendMessage(jid, {
                    text: `❌ Reply to an image or video with ${config.prefix}sticker`
                });
            }
            
            const mediaType = quotedMsg.imageMessage ? 'image' : 
                            quotedMsg.videoMessage ? 'video' : null;
            
            if (!mediaType) {
                return await sock.sendMessage(jid, {
                    text: '❌ Please reply to an image or video'
                });
            }
            
            // Send processing message
            await sock.sendMessage(jid, {
                text: '⏳ Creating sticker...'
            });
            
            // Download media
            const buffer = await downloadMediaMessage(
                { message: quotedMsg },
                'buffer',
                {}
            );
            
            // Create temp file
            const tempFile = path.join('/tmp', `sticker_${Date.now()}.${mediaType === 'image' ? 'jpg' : 'mp4'}`);
            const outputFile = path.join('/tmp', `sticker_${Date.now()}.webp`);
            
            await fs.writeFile(tempFile, buffer);
            
            // Convert to sticker using ffmpeg
            if (mediaType === 'image') {
                await execPromise(`ffmpeg -i ${tempFile} -vf "scale=512:512:force_original_aspect_ratio=decrease" ${outputFile}`);
            } else {
                // Video sticker (max 7 seconds)
                await execPromise(`ffmpeg -i ${tempFile} -t 7 -vf "scale=512:512:force_original_aspect_ratio=decrease" -c:v libwebp ${outputFile}`);
            }
            
            // Read the sticker file
            const stickerBuffer = await fs.readFile(outputFile);
            
            // Send sticker
            await sock.sendMessage(jid, {
                sticker: stickerBuffer
            });
            
            // Cleanup
            await fs.unlink(tempFile).catch(() => {});
            await fs.unlink(outputFile).catch(() => {});
            
        } catch (error) {
            console.error('Sticker error:', error);
            await sock.sendMessage(msg.key.remoteJid, {
                text: '❌ Error creating sticker. Make sure ffmpeg is installed!'
            });
        }
    }
};