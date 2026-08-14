'use strict';
const config = require('../../config');
const { send } = require('../../helpers');

const MESSAGE = '🚧 *Spotify downloder is currently still in development.*\n\nStay tuned for updates!';

module.exports = {
    name: 'spotify',
    aliases: ['spotifydl'],
    category: 'download',
    description: 'Feature in development',
    usage: `${config.prefix}spotify`,

    async execute(sock, msg, args) {
        const jid = msg.key.remoteJid;
        try {
            await send(sock, jid, MESSAGE);
        } catch (err) {
            console.error('[spotify]', err.message);
        }
    },
};