'use strict';
const config = require('../../config');
const { send } = require('../../helpers');

const MESSAGE = '🚧 *Mediafire downloader is currently still in development.*\n\nStay tuned for updates!';

module.exports = {
    name: 'mediafire',
    aliases: ['mfdl', 'mfdownload'],
    category: 'download',
    description: 'Feature in development',
    usage: `${config.prefix}mediafire`,

    async execute(sock, msg, args) {
        const jid = msg.key.remoteJid;
        try {
            await send(sock, jid, MESSAGE);
        } catch (err) {
            console.error('[mediafire]', err.message);
        }
    },
};