'use strict';
const config = require('../../config');
const { send } = require('../../helpers');

const MESSAGE = '🚧 *Antinsfw is currently still in development.*\n\nStay tuned for updates!';

module.exports = {
    name: 'antinsfw',
    aliases: ['antilewd', 'antiadult'],
    category: 'owner',
    description: 'Feature in development',
    usage: `${config.prefix}antinsfw`,

    async execute(sock, msg, args) {
        const jid = msg.key.remoteJid;
        try {
            await send(sock, jid, MESSAGE);
        } catch (err) {
            console.error('[antinsfw]', err.message);
        }
    },
};