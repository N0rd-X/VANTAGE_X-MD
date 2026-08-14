'use strict';
const config = require('../../config');
const { send, ownerGuard, makeDB } = require('../../helpers');

const db = makeDB('prefix', { prefix: config.prefix });

module.exports = {
    name: 'setprefix',
    aliases: ['prefix'],
    category: 'owner',
    description: 'Change the bot command prefix',
    usage: `${config.prefix}setprefix <new_prefix>`,
    ownerOnly: true,

    async execute(sock, msg, args) {
        const jid = msg.key.remoteJid;
        try {
            if (await ownerGuard(sock, msg)) return;
            if (!args[0]) return send(sock, jid, `❌ Usage: ${this.usage}`);

            const newPrefix = args[0];
            config.prefix   = newPrefix;
            db.save({ prefix: newPrefix });

            await send(sock, jid, `✅ Prefix changed to: *${newPrefix}*`);
        } catch (err) {
            console.error('[setprefix]', err.message);
            await send(sock, jid, global.mess.error);
        }
    },
};
