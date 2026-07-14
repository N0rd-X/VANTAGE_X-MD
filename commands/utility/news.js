'use strict';
const config = require('../../config');
const { send } = require('../../helpers');

const MESSAGE = '🚧 *News is currently still in development.*\n\nStay tuned for updates!';

module.exports = {
    name: 'news',
    aliases: ['headlines'],
    category: 'utility',
    description: 'Feature in development',
    usage: `${config.prefix}news`,

    async execute(sock, msg, args) {
        const jid = msg.key.remoteJid;
        try {
            await send(sock, jid, MESSAGE);
        } catch (err) {
            console.error('[news]', err.message);
        }
    },
};