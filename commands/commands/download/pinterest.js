'use strict';
const config = require('../../config');
const { send } = require('../../helpers');

const MESSAGE = '🚧 *Pinterest downloder is currently still in development.*\n\nStay tuned for updates!';

module.exports = {
    name: 'pinterest',
    aliases: ['pin', 'pint'],
    category: 'download',
    description: 'Feature in development',
    usage: `${config.prefix}ai`,

    async execute(sock, msg, args) {
        const jid = msg.key.remoteJid;
        try {
            await send(sock, jid, MESSAGE);
        } catch (err) {
            console.error('[pinterest]', err.message);
        }
    },
};