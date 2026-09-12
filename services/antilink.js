'use strict';

/**
 * Link-deletion enforcement
 */

const { getGroupContext } = require('../helpers');

let antilinkCmd;
try {
    antilinkCmd = require('../commands/group/antilink');
} catch {
    antilinkCmd = null;
}

const LINK_RE = /(https?:\/\/|www\.|chat\.whatsapp\.com\/|t\.me\/)/i;

async function check(sock, jid, sender, body, key, ownerFlag) {
    if (!antilinkCmd || !body || !LINK_RE.test(body)) return false;
    if (ownerFlag) return false;
    if (!antilinkCmd.isEnabled(jid)) return false;

    try {
        const ctx = await getGroupContext(sock, { key: { remoteJid: jid, participant: sender } });
        if (ctx?.senderIsAdmin) return false; // admins exempt

        await sock.sendMessage(jid, { delete: key });
        await sock.sendMessage(jid, {
            text:     `🔗 @${sender.split('@')[0]}, links aren't allowed here.`,
            mentions: [sender],
        });
        return true;
    } catch (err) {
        console.error('[antilink]', err.message);
        return false;
    }
}

module.exports = { check };
