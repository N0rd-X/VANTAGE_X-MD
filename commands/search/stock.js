'use strict';
const config = require('../../config');
const { send } = require('../../helpers');

const MESSAGE = '🚧 *Stock is currently still in development.*\n\nStay tuned for updates!';

module.exports = {
    name: 'stock',
    aliases: ['ticker'],
    category: 'search',
    description: 'Feature in development',
    usage: `${config.prefix}stock`,

    async execute(sock, msg, args) {
        const jid = msg.key.remoteJid;
        try {
            await send(sock, jid, MESSAGE);
        } catch (err) {
            console.error('[stock]', err.message);
        }
    },
};