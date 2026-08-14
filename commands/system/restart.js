'use strict';

const config   = require('../../config');
const { send } = require('../../helpers');

module.exports = {
    name: 'restart',
    aliases: ['reboot'],
    category: 'owner',
    description: 'Restart the bot',
    usage: `${config.prefix}restart`,
    ownerOnly: true,

    async execute(sock, msg, args) {
        const jid = msg.key.remoteJid;
        try {
            await sock.sendMessage(jid, {
                text: `⬡ ᴠx-sʏs — restarting\n▸ Process will exit. PM2 / your host should bring it back up.`
            }, { quoted: msg });

            setTimeout(() => process.exit(0), 1500);

        } catch (err) {
            console.error('[restart]', err.message);
            await send(sock, jid, global.mess.error);
        }
    }
};
