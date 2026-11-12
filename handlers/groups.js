'use strict';

const config   = require('../config');
const settings = require('../services/groupsettings');

const KIND_FOR_ACTION = { add: 'welcome', remove: 'goodbye' };

// Attach the group-participants.update handler to the socket.
function attach(sock) {
    sock.ev.on('group-participants.update', async ({ id, participants, action }) => {
        if (!global.welcome) return;

        // Cheap exits first: promotions/demotions, and groups where this event is switched off
        const kind = KIND_FOR_ACTION[action];
        if (!kind || !settings.isOn(id, kind)) return;

        let meta;
        try {
            meta = await sock.groupMetadata(id);
        } catch (err) {
            console.error('[GROUPS] groupMetadata failed:', err.message);
            return;
        }

        const tpl         = settings.template(id, kind);
        const details     = { group: meta.subject || 'this group', desc: meta.desc || '', count: meta.participants.length };
        const contextInfo = { forwardingScore: 2000, isForwarded: true };

        for (const p of participants) {
            const participant = typeof p === 'string' ? p : p?.id;      // newer Baileys sends objects
            if (!participant) continue;

            const text = settings.render(tpl, { ...details, num: participant.split('@')[0] });

            let ppUrl;
            try {
                ppUrl = await sock.profilePictureUrl(participant, 'image');
            } catch {
                ppUrl = config.vantagexpp;
            }

            await sock.sendMessage(id, {
                image:    { url: ppUrl },
                caption:  text,
                mentions: [participant],
                contextInfo,
            }).catch(() =>
                // Fallback to text-only if the picture can't be sent
                sock.sendMessage(id, { text, mentions: [participant] })
                    .catch(err => console.error('[GROUPS] Send failed:', err.message))
            );
        }
    });
}

module.exports = { attach };
