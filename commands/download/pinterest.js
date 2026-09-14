'use strict';
const config = require('../../config');
const { send } = require('../../helpers');

const MESSAGE = '🚧 *Pinterest downloader is currently still in development.*\n\nStay tuned for updates!';

module.exports = {
    name: 'pinterest',
    aliases: ['pin', 'pint'],
    category: 'download',
    description: 'Feature in development',
    usage: `${config.prefix}pinterest`,

    async execute(sock, msg, args) {
        const jid = msg.key.remoteJid;
        try {
            await send(sock, jid, MESSAGE);
        } catch (err) {
            console.error('[pinterest]', err.message);
        }
    },
};