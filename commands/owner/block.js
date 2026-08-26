'use strict';

const config = require('../../config');
const { ownerGuard, getTarget } = require('../../helpers');

module.exports = {
    name: 'block',
    aliases: ['ban', 'banuser'],
    category: 'owner',
    description: 'Block a user',
    usage: `${config.prefix}block @user`,
    ownerOnly: true,

    async execute(sock, msg, args) {
        try {
            const jid = msg.key.remoteJid;
            if (await ownerGuard(sock, msg)) return;

            const mentioned = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid;
            const target = mentioned?.[0] || (args[0]?.replace(/[^0-9]/g, '') + '@s.whatsapp.net');

            if (!target) {
                return await sock.sendMessage(jid, { text: `❌ Usage: ${this.usage}` });
            }

            await sock.updateBlockStatus(target, 'block');
            await sock.sendMessage(jid, {
                text: `🚫 Blocked @${target.split('@')[0]}`,
                mentions: [target],
            });
        } catch (error) {
            console.error('Block error:', error.message);
            await sock.sendMessage(msg.key.remoteJid, { text: global.mess.error });
        }
    }
};
