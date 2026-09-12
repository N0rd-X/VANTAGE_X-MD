'use strict';
const config = require('../../config');
const { send, ownerGuard, getTarget } = require('../../helpers');

module.exports = {
    name: 'unblock',
    aliases: ['unbanuser'],
    category: 'owner',
    description: 'Unblock a user',
    usage: `${config.prefix}unblock @user`,
    ownerOnly: true,

    async execute(sock, msg, args) {
        const jid = msg.key.remoteJid;
        try {
            if (await ownerGuard(sock, msg)) return;
            const target = getTarget(msg, args);
            if (!target) return send(sock, jid, `❌ Usage: ${this.usage}`);

            await sock.updateBlockStatus(target, 'unblock');
            await send(sock, jid, `✅ Unblocked @${target.split('@')[0]}`, { mentions: [target] });
        } catch (err) {
            console.error('[unblock]', err.message);
            await send(sock, jid, global.mess.error);
        }
    },
};
