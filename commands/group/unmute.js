'use strict';

const config   = require('../../config');
const { send, requireGroup } = require('../../helpers');

module.exports = {
    name: 'unmute',
    aliases: ['open', 'unlock'],
    category: 'group',
    description: 'Unmute the group (allow all members to send messages)',
    usage: `${config.prefix}unmute`,

    async execute(sock, msg, args) {
        const jid = msg.key.remoteJid;
        try {
            const ctx = await requireGroup(sock, msg, { admin: true, botAdmin: true });
            if (!ctx) return;

            await sock.groupSettingUpdate(jid, 'not_announcement');
            await send(sock, jid, '🔊 Group unmuted. All members can send messages.');

        } catch (err) {
            console.error('[unmute]', err.message);
            await send(sock, jid, global.mess.error);
        }
    }
};
