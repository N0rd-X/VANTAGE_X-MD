'use strict';

const config   = require('../../config');
const { send } = require('../../helpers');

module.exports = {
    name: 'unmute',
    aliases: ['open', 'unlock'],
    category: 'group',
    description: 'Unmute the group (allow all members to send messages)',
    usage: `${config.prefix}unmute`,

    async execute(sock, msg, args) {
        const jid = msg.key.remoteJid;
        try {
            if (!jid.endsWith('@g.us')) return send(sock, jid, global.mess.group);

            const meta    = await sock.groupMetadata(jid);
            const sender  = msg.key.participant || msg.key.remoteJid;
            const botId   = sock.user.id.replace(/:\d+/, '') + '@s.whatsapp.net';
            const find    = (id) => meta.participants.find(p => p.id === id);

            if (!find(sender)?.admin) return send(sock, jid, global.mess.admin);
            if (!find(botId)?.admin)  return send(sock, jid, global.mess.botAdmin);

            await sock.groupSettingUpdate(jid, 'not_announcement');
            await send(sock, jid, '🔊 Group unmuted. All members can send messages.');

        } catch (err) {
            console.error('[unmute]', err.message);
            await send(sock, jid, global.mess.error);
        }
    }
};
