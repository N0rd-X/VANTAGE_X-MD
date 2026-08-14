'use strict';
const config = require('../../config');
const { send } = require('../../helpers');

const MESSAGE = '🚧 *Shazam is currently still in development.*\n\nStay tuned for updates!';

module.exports = {
    name: 'shazam',
    aliases: ['whatmusic', 'findsong'],
    category: 'search',
    description: 'Feature in development',
    usage: `${config.prefix}shazam`,

    async execute(sock, msg, args) {
        const jid = msg.key.remoteJid;
        try {
            await send(sock, jid, MESSAGE);
        } catch (err) {
            console.error('[shazam]', err.message);
        }
    },
};