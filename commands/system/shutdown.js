'use strict';

const config               = require('../../config');
const { send, ownerGuard } = require('../../helpers');

module.exports = {
    name:        'shutdown',
    aliases:     ['poweroff', 'stop'],
    category:    'system',
    description: 'Stop the bot process without triggering an automatic restart',
    usage:       `${config.prefix}shutdown`,
    ownerOnly:   true,

    async execute(sock, msg, args) {
        const jid = msg.key.remoteJid;
        if (await ownerGuard(sock, msg)) return;

        await sock.sendMessage(jid, {
            text: '⬡ ᴠx-sʏs — shutting down\n▸ Process terminating. Restart manually when ready.',
        }, { quoted: msg }).catch((err) => console.error('[shutdown] sendMessage failed:', err.message));

        setTimeout(() => process.kill(process.pid, 'SIGINT'), 1500);
    },
};
