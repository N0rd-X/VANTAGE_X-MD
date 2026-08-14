'use strict';
const config = require('../../config');
const { send } = require('../../helpers');

const MESSAGE = '🚧 *Background remover is currently still in development.*\n\nStay tuned for updates!';

module.exports = {
    name: 'removebg',
    aliases: ['rmvbg', 'nobg'],
    category: 'utility',
    description: 'Feature in development',
    usage: `${config.prefix}removebg`,

    async execute(sock, msg, args) {
        const jid = msg.key.remoteJid;
        try {
            await send(sock, jid, MESSAGE);
        } catch (err) {
            console.error('[removebg]', err.message);
        }
    },
};