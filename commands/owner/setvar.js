'use strict';
const config = require('../../config');
const { send, ownerGuard, makeDB } = require('../../helpers');

const db = makeDB('vars', {});

const PROTECTED = ['ownernumber'];

module.exports = {
    name: 'setvar',
    aliases: ['setenv', 'var'],
    category: 'owner',
    description: 'Set a bot config variable',
    usage: `${config.prefix}setvar <key> <value>`,
    ownerOnly: true,

    async execute(sock, msg, args) {
        const jid = msg.key.remoteJid;
        try {
            if (await ownerGuard(sock, msg)) return;
            if (args.length < 2) return send(sock, jid, `❌ Usage: ${this.usage}`);

            const [key, ...rest] = args;
            const value = rest.join(' ');

            if (PROTECTED.includes(key)) {
                return send(sock, jid, `⛔ "${key}" is protected and cannot be changed with setvar.`);
            }

            config[key] = value;
            const vars  = db.load();
            vars[key]   = value;
            db.save(vars);

            await send(sock, jid, `✅ *${key}* = ${value}`);
        } catch (err) {
            console.error('[setvar]', err.message);
            await send(sock, jid, global.mess.error);
        }
    },
};
