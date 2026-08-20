'use strict';
const config = require('../../config');
const { send, ownerGuard } = require('../../helpers');

module.exports = {
    name: 'setbio',
    aliases: ['setstatus', 'bio'],
    category: 'owner',
    description: 'Set bot WhatsApp status/bio',
    usage: `${config.prefix}setbio <text>`,
    ownerOnly: true,

    async execute(sock, msg, args) {
        const jid = msg.key.remoteJid;
        try {
            if (await ownerGuard(sock, msg)) return;
            if (!args.length) return send(sock, jid, `❌ Usage: ${this.usage}`);

            const bio = args.join(' ');
            await sock.updateProfileStatus(bio);
            await send(sock, jid, `✅ Bio updated to:\n_${bio}_`);
        } catch (err) {
            console.error('[setbio]', err.message);
            await send(sock, jid, global.mess.error);
        }
    },
};
