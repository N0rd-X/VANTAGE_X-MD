/**
 * VANTAGE-X MD Message Styling System
 */

const config = require('../config');
const fs = require('fs');

class VantageXMessageStyle {
    
    /**
     * Send fancy card message with image (Like Xlicon screenshot)
     * @param {Object} sock - Baileys socket
     * @param {String} jid - Chat JID
     * @param {Object} options - Message options
     */
    async sendFancyMessage(sock, jid, options = {}) {
        const {
            image,              // Image URL or buffer
            caption,            // Main caption/text
            title,              // Link preview title
            body,               // Link preview body
            thumbnail,          // Thumbnail for link preview
            sourceUrl,          // URL that opens when clicked
            mediaType = 1,      // 1 for image, 2 for video
            renderLargerThumbnail = true,
            showAdAttribution = true
        } = options;

        try {
            const message = {
                image: image ? (typeof image === 'string' ? { url: image } : image) : undefined,
                caption: caption || '',
                contextInfo: {
                    externalAdReply: {
                        title: title || config.botname,
                        body: body || config.wm,
                        thumbnailUrl: thumbnail || image,
                        sourceUrl: sourceUrl || config.whatsappgroup,
                        mediaType: mediaType,
                        showAdAttribution: showAdAttribution,
                        renderLargerThumbnail: renderLargerThumbnail
                    }
                }
            };

            return await sock.sendMessage(jid, message);
        } catch (error) {
            console.error('Error sending fancy message:', error);
            // Fallback to simple message
            return await sock.sendMessage(jid, {
                text: caption || 'Message',
                contextInfo: {
                    externalAdReply: {
                        title: title,
                        body: body,
                        sourceUrl: sourceUrl
                    }
                }
            });
        }
    }

    async sendOwnerMentions(sock, jid, ownerName, senderName) {
        const mentionsImages = [
            'https://res.cloudinary.com/fgeb24n7/image/upload/v1783969654/status_zuf9mc.png',
            config.vantagexpp
        ].filter(Boolean);

        const randomImage = protectionImages[Math.floor(Math.random() * protectionImages.length)];

        const caption = `⚠️ *You tagged my owner ${ownerName}*\n\n🛡️ Please respect the owner, ${senderName}!`;

        return await this.sendFancyMessage(sock, jid, {
            image: randomImage,
            caption: caption,
            title: `You tagged my owner ${ownerName}`,
            body: `${config.botname} MULTIDEVICE`,
            thumbnail: randomImage,
            sourceUrl: config.whatsappgroup || config.link,
            renderLargerThumbnail: true
        });
    }

    /**
     * Send alive/status message with card
     */
    async sendAliveMessage(sock, jid) {
        const uptime = this.formatUptime(process.uptime());
        const os = require('os');
        const totalMem = Math.floor(os.totalmem() / 1024 / 1024);
        const freeMem = Math.floor(os.freemem() / 1024 / 1024);
        const usedMem = totalMem - freeMem;
        
        const caption = `╭━━━❰ ${config.botname} ❱━━━╮
┃ ⚡ *ʙᴏᴛ ᴀʟɪᴠᴇ*
┃ 
┃ 👑 *ᴏᴡɴᴇʀ:* ${config.ownername}
┃ 📊 *ᴍᴇᴍᴏʀʏ:* ${usedMem}MB / ${totalMem}MB
┃ ⏱️ *ᴜᴘᴛɪᴍᴇ:* ${uptime}
┃ 🔣 *ᴘʀᴇғɪx:* ${config.prefix}
┃ 🏷️ *ᴠᴇʀsɪᴏɴ:* 0.0.0.6
╰━━━━━━━━━━━━━━━━╯`;

        return await this.sendFancyMessage(sock, jid, {
            image: config.vantagexpp || 'https://res.cloudinary.com/fgeb24n7/image/upload/v1783969654/status_zuf9mc.png',
            caption: caption,
            title: '🔒 VANTAGE-X MD ACTIVE',
            body: 'Bot Status',
            sourceUrl: config.whatsappgroup,
            renderLargerThumbnail: true
        });
    }

    /**
     * Send menu with fancy styling
     */
    async sendMenu(sock, jid, menuText) {
        return await this.sendFancyMessage(sock, jid, {
            image: config.vantagexpp || 'https://res.cloudinary.com/fgeb24n7/image/upload/v1783969775/thumb_mbienq.png',
            caption: menuText,
            title: `${config.botname} - Menu`,
            body: 'Command List',
            sourceUrl: config.whatsappgroup,
            renderLargerThumbnail: true
        });
    }

    /**
     * Send terminal-style message
     */
    formatTerminalExec(code, result, isError = false) {
        const status = isError ? '❌' : '✅';
        const resultType = isError ? 'Error' : 'Result';
        const time = new Date().toLocaleTimeString();
        
        return `╭━━━━━━━━━━━━━━━━━━━━╮
┃ 🔴 🟡 🟢
┃ 
┃ ${config.botname} MULTIDEVICE
┃ [ Time - ${time} ]
╰━━━━━━━━━━━━━━━━━━━━╯

*${config.botname} Exec*

📝 *Code:*
\`\`\`${code}\`\`\`

${status} *${resultType}:*
\`\`\`${result}\`\`\``;
    }

    /**
     * Send eval result with terminal styling
     */
    async sendEvalResult(sock, jid, code, result, isError = false) {
        const terminalText = this.formatTerminalExec(code, result, isError);
        
        return await sock.sendMessage(jid, {
            text: terminalText,
            contextInfo: {
                externalAdReply: {
                    title: `${config.botname} Exec`,
                    body: isError ? '❌ Error Occurred' : '✅ Success',
                    sourceUrl: config.whatsappgroup,
                    thumbnailUrl: config.vantagexpp
                }
            }
        });
    }

    /**
     * Send button message
     */
    async sendButtonMessage(sock, jid, text, buttons, image = null) {
        try {
            const buttonMessage = {
                text: text,
                footer: config.wm,
                buttons: buttons.map((btn, index) => ({
                    buttonId: btn.id || `button_${index}`,
                    buttonText: { displayText: btn.text },
                    type: 1
                })),
                headerType: image ? 4 : 1
            };

            if (image) {
                buttonMessage.image = typeof image === 'string' ? { url: image } : image;
            }

            return await sock.sendMessage(jid, buttonMessage);
        } catch (error) {
            console.error('Error sending button message:', error);
            // Fallback to text message
            return await sock.sendMessage(jid, { text: text });
        }
    }

    /**
     * Send list message with sections
     */
    async sendListMessage(sock, jid, title, description, buttonText, sections) {
        try {
            const listMessage = {
                text: description,
                footer: config.wm,
                title: title,
                buttonText: buttonText,
                sections: sections
            };

            return await sock.sendMessage(jid, listMessage);
        } catch (error) {
            console.error('Error sending list message:', error);
            // Fallback
            return await sock.sendMessage(jid, { text: description });
        }
    }

    /**
     * Format uptime
     */
    formatUptime(seconds) {
        const days = Math.floor(seconds / 86400);
        const hours = Math.floor((seconds % 86400) / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        return `${days}d ${hours}h ${minutes}m`;
    }

    /**
     * Send text with link preview
     */
    async sendWithLinkPreview(sock, jid, text, linkPreview) {
        const {
            title = config.botname,
            body = config.wm,
            thumbnail = config.vantagexpp,
            sourceUrl = config.whatsappgroup
        } = linkPreview;

        return await sock.sendMessage(jid, {
            text: text,
            contextInfo: {
                externalAdReply: {
                    title: title,
                    body: body,
                    thumbnailUrl: thumbnail,
                    sourceUrl: sourceUrl,
                    mediaType: 1,
                    showAdAttribution: true,
                    renderLargerThumbnail: true
                }
            }
        });
    }

    /**
     * Send video/document with caption and link preview
     */
    async sendMediaWithPreview(sock, jid, media, type, options = {}) {
        const {
            caption = '',
            title = config.botname,
            body = config.wm,
            thumbnail = config.vantagexpp,
            sourceUrl = config.whatsappgroup
        } = options;

        const message = {
            caption: caption,
            contextInfo: {
                externalAdReply: {
                    title: title,
                    body: body,
                    thumbnailUrl: thumbnail,
                    sourceUrl: sourceUrl,
                    mediaType: 1,
                    showAdAttribution: true,
                    renderLargerThumbnail: true
                }
            }
        };

        message[type] = typeof media === 'string' ? { url: media } : media;

        return await sock.sendMessage(jid, message);
    }

    /**
     * Reply to a message with fancy styling
     */
    async replyWithStyle(sock, msg, text, linkPreview = {}) {
        const {
            title = config.botname,
            body = config.wm,
            thumbnail = config.vantagexpp,
            sourceUrl = config.whatsappgroup
        } = linkPreview;

        return await sock.sendMessage(msg.key.remoteJid, {
            text: text,
            contextInfo: {
                externalAdReply: {
                    title: title,
                    body: body,
                    thumbnailUrl: thumbnail,
                    sourceUrl: sourceUrl,
                    mediaType: 1,
                    showAdAttribution: true,
                    renderLargerThumbnail: true
                }
            }
        }, { quoted: msg });
    }

    /**
     * Send contact card
     */
    async sendContact(sock, jid, contactInfo) {
        const vcard = `BEGIN:VCARD
VERSION:0.0.0.6
FN:${contactInfo.name}
TEL;type=CELL;type=VOICE;waid=${contactInfo.number}:${contactInfo.number}
END:VCARD`;

        return await sock.sendMessage(jid, {
            contacts: {
                displayName: contactInfo.name,
                contacts: [{ vcard }]
            }
        });
    }

    /**
     * Send location
     */
    async sendLocation(sock, jid, latitude, longitude, name = '') {
        return await sock.sendMessage(jid, {
            location: {
                degreesLatitude: latitude,
                degreesLongitude: longitude,
                name: name
            }
        });
    }
}

// Export singleton instance
module.exports = new VantageXMessageStyle();
