'use strict';
const config = require('../../config');
const { downloadMediaMessage } = require('@whiskeysockets/baileys');
const fs   = require('fs').promises;
const path = require('path');
const { send, ownerGuard, getQuotedImage } = require('../../helpers');

const MENU_IMG_PATH = path.join(__dirname, '../../VantageXMedia/thumb.jpg');

module.exports = {
    name: 'setmenuimg',
    aliases: ['menuimg', 'setmenu'],
    category: 'owner',
    description: 'Set menu background image (reply to image)',
    usage: `${config.prefix}setmenuimg`,
    ownerOnly: true,

    async execute(sock, msg, args) {
        const jid = msg.key.remoteJid;
        try {
            if (await ownerGuard(sock, msg)) return;

            const quoted = getQuotedImage(msg);
            if (!quoted) return send(sock, jid, `❌ Reply to an image with ${config.prefix}setmenuimg`);

            const buffer = await downloadMediaMessage(quoted.quotedMsg, 'buffer', {});
            await fs.mkdir(path.dirname(MENU_IMG_PATH), { recursive: true });
            await fs.writeFile(MENU_IMG_PATH, buffer);
            await send(sock, jid, '✅ Menu image updated.');
        } catch (err) {
            console.error('[setmenuimg]', err.message);
            await send(sock, jid, global.mess.error);
        }
    },
};
