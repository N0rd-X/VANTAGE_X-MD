'use strict';
const config = require('../../config');
const { send, ownerGuard } = require('../../helpers');

module.exports = {
    name: 'setdesc',
    aliases: ['setdescription'],
    category: 'owner',
    description: 'Set the current group description',
    usage: `${config.prefix}setdesc <text>`,
    ownerOnly: true,

    async execute(sock, msg, args) {
        const jid = msg.key.remoteJid;
        try {
            if (await ownerGuard(sock, msg)) return;
            if (!jid.endsWith('@g.us')) return send(sock, jid, global.mess.group);
            if (!args.length) return send(sock, jid, `❌ Usage: ${this.usage}`);

            const desc = args.join(' ');
            await sock.groupUpdateDescription(jid, desc);
            await send(sock, jid, '✅ Group description updated.');
        } catch (err) {
            console.error('[setdesc]', err.message);
            await send(sock, jid, global.mess.error);
        }
    },
};
