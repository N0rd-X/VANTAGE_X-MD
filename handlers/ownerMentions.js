'use strict';

/**
 * Acknowledges owner mentions when tagged by non-owners.
 */

const messageStyle = require('../lib/messageStyle');
const config       = require('../config');

/**
 * @param {object} sock - Baileys socket
 * @param {object} msg  - raw message (needs msg.key, msg.message, msg.pushName)
 * @returns {boolean} true if the owner was tagged (caller should stop processing)
 */
async function handleOwnerProtection(sock, msg) {
    try {
        const jid    = msg.key.remoteJid;
        const sender = msg.key.participant || msg.key.remoteJid;

        const mentioned = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid;
        if (!mentioned || mentioned.length === 0) return false;

        const ownerJid = `${config.ownernumber}@s.whatsapp.net`;
        if (!mentioned.includes(ownerJid)) return false;
        if (sender === ownerJid) return false; // owner tagging themselves — ignore

        const senderName = msg.pushName || 'User';
        await messageStyle.sendOwnerProtection(sock, jid, config.ownername, senderName);

        console.log(`[OWNER PROTECTION] ${senderName} tagged owner in ${jid}`);
        return true;
    } catch (error) {
        console.error('Owner protection error:', error);
        return false;
    }
}

module.exports = { handleOwnerProtection };
