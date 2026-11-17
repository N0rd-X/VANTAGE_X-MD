'use strict';

const config           = require('../../config');
const { requireGroup } = require('../../helpers');
const antinsfw         = require('../../services/antinsfw');

module.exports = {
    name: 'antinsfw',
    aliases: ['antilewd', 'nonsfw', 'no18+'],
    category: 'group',
    description: 'Toggle anti-NSFW protection. Deletes explicit images sent by non-admins.',
    usage: `${config.prefix}antinsfw <on|off>`,

    async execute(sock, msg, args) {
        const jid = msg.key.remoteJid;
        try {
            const ctx = await requireGroup(sock, msg, { admin: true, botAdmin: true });
            if (!ctx) return;

            const action = args[0]?.toLowerCase();
            if (!['on', 'off'].includes(action)) {
                const current = antinsfw.isEnabled(jid) ? 'ON 🟢' : 'OFF 🔴';
                return await sock.sendMessage(jid, {
                    text: `🔞 *Anti-NSFW Status*: ${current}\n\nUsage: ${this.usage}`,
                });
            }

            antinsfw.setEnabled(jid, action === 'on');
            await sock.sendMessage(jid, {
                text: action === 'on'
                    ? '🔞 *Anti-NSFW enabled.*\nExplicit images from non-admins will be deleted.'
                    : '🔞 *Anti-NSFW disabled.*\nImages are no longer scanned.',
            });
        } catch (err) {
            console.error('[antinsfw]', err.message);
            await sock.sendMessage(jid, { text: global.mess?.error || 'Something went wrong.' });
        }
    },
};
