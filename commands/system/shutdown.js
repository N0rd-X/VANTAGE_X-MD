'use strict';

const config   = require('../../config');
const { send } = require('../../helpers');

module.exports = {
    name: 'shutdown',
    aliases: ['poweroff', 'stop'],
    category: 'owner',
    description: 'Shut down the bot',
    usage: `${config.prefix}shutdown`,
    ownerOnly: true,

    async execute(sock, msg, args) {
        const jid = msg.key.remoteJid;
        try {
            await sock.sendMessage(jid, {
                text: `⬡ ᴠx-sʏs — shutting down\n▸ Process terminating. Restart manually when ready.`
            }, { quoted: msg });

            setTimeout(() => process.exit(0), 1500);

        } catch (err) {
            console.error('[shutdown]', err.message);
            await send(sock, jid, global.mess.error);
        }
    }
};
