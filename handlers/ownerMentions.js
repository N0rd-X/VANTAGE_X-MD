'use strict';

const config = require('../config');

async function handleOwnerProtection(sock, msg) {
    try {
        const jid    = msg.key.remoteJid;
        const sender = msg.key.participant || msg.key.remoteJid;

        const mentioned = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid;
        if (!mentioned?.length) return false;

        const ownerJid = `${config.ownernumber}@s.whatsapp.net`;
        if (!mentioned.includes(ownerJid)) return false;
        if (sender === ownerJid) return false; // owner tagging themselves — ignore

        const senderName = msg.pushName || 'User';

        await sock.sendMessage(jid, {
            image:       { url: config.vantagexpp },
            caption:     `⚠️ *You tagged my owner ${config.ownername}*\n\n🛡️ Please respect the owner, ${senderName}!`,
            contextInfo: {
                externalAdReply: {
                    title:                 `You tagged my owner ${config.ownername}`,
                    body:                  `${config.botname} MULTIDEVICE`,
                    thumbnailUrl:          config.vantagexpp,
                    sourceUrl:             config.whatsappgroup,
                    mediaType:             1,
                    showAdAttribution:     true,
                    renderLargerThumbnail: true,
                },
            },
        });

        console.log(`[OWNER PROTECTION] ${senderName} tagged owner in ${jid}`);
        return true;
    } catch (err) {
        console.error('[ownerMentions]', err.message);
        return false;
    }
}

module.exports = { handleOwnerProtection };
