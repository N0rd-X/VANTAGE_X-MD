'use strict';
const config = require('../../config');
const { send } = require('../../helpers');

const MESSAGE = '🚧 *Instagram story downloader is currently still in development.*\n\nStay tuned for updates!';

module.exports = {
    name: 'igstory',
    aliases: ['igs', 'instastory'],
    category: 'download',
    description: 'Features in development',
    usage: `${config.prefix}igstory`,

    async execute(sock, msg, args) {
        const jid = msg.key.remoteJid;
        try {
            await send(sock, jid, MESSAGE);
        } catch (err) {
            console.error('[igstory]', err.message);
        }
    },
};