'use strict';
const config = require('../../config');
const { send } = require('../../helpers');

const MESSAGE = '🚧 *Remini is currently still in development.*\n\nStay tuned for updates!';

module.exports = {
    name: 'remini',
    aliases: ['upscale', 'hd'],
    category: 'ai',
    description: 'Feature in development',
    usage: `${config.prefix}remini`,

    async execute(sock, msg, args) {
        const jid = msg.key.remoteJid;
        try {
            await send(sock, jid, MESSAGE);
        } catch (err) {
            console.error('[remini]', err.message);
        }
    },
};