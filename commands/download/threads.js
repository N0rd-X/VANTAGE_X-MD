'use strict';
const config = require('../../config');
const { send } = require('../../helpers');

const MESSAGE = '🚧 *Threads downloder is currently still in development.*\n\nStay tuned for updates!';

module.exports = {
    name: 'threads',
    aliases: ['threadsdl', 'threadsdownload'],
    category: 'download',
    description: 'Feature in development',
    usage: `${config.prefix}threads`,

    async execute(sock, msg, args) {
        const jid = msg.key.remoteJid;
        try {
            await send(sock, jid, MESSAGE);
        } catch (err) {
            console.error('[threads]', err.message);
        }
    },
};