'use strict';

const config = require('../../config');

module.exports = {
    name: 'owner',
    aliases: ['ownercontact', 'contact'],
    category: 'owner',
    description: 'Get owner contact card',
    usage: `${config.prefix}owner`,

    async execute(sock, msg, args) {
        const jid = msg.key.remoteJid;
        try {
            const num  = global.ownernumber || config.ownernumber || '';
            const name = global.ownername   || config.ownername   || 'Owner';

            if (!num) {
                return await sock.sendMessage(jid, {
                    text: '⚠️ Owner number is not configured.\nAsk the bot owner to set it.'
                }, { quoted: msg });
            }

            // Send info text first
            await sock.sendMessage(jid, {
                text: `👑 *Bot Owner*\n\n*Name:* ${name}\n*Number:* +${num}`
            }, { quoted: msg });

            // Send contact card separately
            await sock.sendMessage(jid, {
                contacts: {
                    displayName: name,
                    contacts: [{
                        vcard: `BEGIN:VCARD\nVERSION:3.0\nFN:${name}\nTEL;waid=${num}:+${num}\nEND:VCARD`
                    }]
                }
            });

        } catch (err) {
            console.error('[owner]', err.message);
            await sock.sendMessage(jid, { text: global.mess.error });
        }
    }
};
