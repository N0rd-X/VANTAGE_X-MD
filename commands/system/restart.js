'use strict';

const config               = require('../../config');
const { send, ownerGuard } = require('../../helpers');

module.exports = {
    name: 'restart',
    aliases: ['reboot'],
    category: 'system',
    description: 'Restart the bot process (requires PM2 / Docker / systemd to bring it back)',
    usage: `${config.prefix}restart`,
    ownerOnly: true,

    async execute(sock, msg, args) {
        const jid = msg.key.remoteJid;
        if (await ownerGuard(sock, msg)) return;

        // Send the confirmation first, then exit regardless of whether it succeeded.
        await sock.sendMessage(jid, {
            text: '⬡ ᴠx-sʏs — restarting\n▸ Process will exit. Your process manager should bring it back up.',
        }, { quoted: msg }).catch((err) => console.error('[restart] sendMessage failed:', err.message));

        setTimeout(() => process.exit(0), 1500);
    },
};
