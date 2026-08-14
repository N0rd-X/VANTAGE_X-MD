'use strict';

/**
 * Handles group participant events: welcome and goodbye messages.
 */

const { readDb } = require('../lib/db');
const config     = require('../config');

/**
 * Attach the group-participants.update handler to the socket.
 *
 * @param {object} sock - Baileys socket
 */
function attach(sock) {
    sock.ev.on('group-participants.update', async ({ id, participants, action }) => {
        if (!global.welcome) return;

        const groupDb = readDb('welcome.json', {});
        const cfg     = groupDb[id];
        if (!cfg?.enabled) return;

        let meta;
        try {
            meta = await sock.groupMetadata(id);
        } catch (err) {
            console.error('[GROUPS] groupMetadata failed:', err.message);
            return;
        }

        const groupName  = meta.subject || 'this group';
        const desc       = meta.desc    || '';
        const ppFallback = config.vantagexpp;

        const contextInfo = { forwardingScore: 2000, isForwarded: true };

        for (const participant of participants) {
            const num = participant.split('@')[0];

            let ppUrl;
            try {
                ppUrl = await sock.profilePictureUrl(participant, 'image');
            } catch {
                ppUrl = ppFallback;
            }

            const isAdd    = action === 'add';
            const isRemove = action === 'remove';

            if (!isAdd && !isRemove) continue;

            const template = isAdd
                ? (cfg.welcomeMsg || `Welcome @${num} to *${groupName}*! 🎉\n\n${desc}`)
                : (cfg.goodbyeMsg || `Goodbye @${num}, we'll miss you! 👋`);

            const text = template
                .replace(/@user/gi,  `@${num}`)
                .replace(/@group/gi, groupName);

            await sock.sendMessage(id, {
                image:       { url: ppUrl },
                caption:     text,
                mentions:    [participant],
                contextInfo,
            }).catch(() =>
                // Fallback to text-only if profile picture fails
                sock.sendMessage(id, { text, mentions: [participant] })
                    .catch(err => console.error('[GROUPS] Send failed:', err.message))
            );
        }
    });
}

module.exports = { attach };
