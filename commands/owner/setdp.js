'use strict';
const config = require('../../config');
const { downloadMediaMessage } = require('@whiskeysockets/baileys');
const { send, ownerGuard, getQuotedImage } = require('../../helpers');

module.exports = {
    name: 'setdp',
    aliases: ['setpp', 'setprofile'],
    category: 'owner',
    description: 'Set bot profile picture (reply to image)',
    usage: `${config.prefix}setdp`,
    ownerOnly: true,

    async execute(sock, msg, args) {
        const jid = msg.key.remoteJid;
        try {
            if (await ownerGuard(sock, msg)) return;

            const quoted = getQuotedImage(msg);
            if (!quoted) return send(sock, jid, `❌ Reply to an image with ${config.prefix}setdp`);

            const buffer = await downloadMediaMessage(quoted.quotedMsg, 'buffer', {});
            await sock.updateProfilePicture(sock.user.id, buffer);
            await send(sock, jid, '✅ Profile picture updated.');
        } catch (err) {
            console.error('[setdp]', err.message);
            await send(sock, jid, global.mess.error);
        }
    },
};
