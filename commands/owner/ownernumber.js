'use strict';

const fs     = require('fs');
const path   = require('path');
const config = require('../../config');
const { send, ownerGuard, makeDB } = require('../../helpers');

const db = makeDB('settings', {});

module.exports = {
    name: 'ownernumber',
    aliases: ['setownernumber', 'setnumber'],
    category: 'owner',
    description: 'Update the bot owner number',
    usage: `${config.prefix}setnumber <number>`,
    ownerOnly: true,

    async execute(sock, msg, args) {
        const jid = msg.key.remoteJid;
        try {
            if (await ownerGuard(sock, msg)) return;

            if (!args[0]) {
                return send(sock, jid,
                    `❌ Usage: ${this.usage}\n\n` +
                    `Example: ${config.prefix}setnumber 27681234567\n\n` +
                    `> ɪɴᴛᴇʀɴᴀᴛɪᴏɴᴀʟ ꜰᴏʀᴍᴀᴛ, ɴᴏ + ᴏʀ ꜱᴘᴀᴄᴇꜱ`
                );
            }

            // Strip everything except digits
            const number = args[0].replace(/\D/g, '');
            if (number.length < 7 || number.length > 15) {
                return send(sock, jid, `❌ Invalid number format. Use international format, e.g. 27681234567`);
            }

            // Update in memory — immediately effective for this session
            config.ownernumber        = number;
            config.BOT.owner.number   = number;
            global.ownernumber        = number;

            // Persist to settings.json so it survives restart
            const saved = db.load();
            saved.ownernumber = number;
            db.save(saved);

            await send(sock, jid,
                `✅ *Owner number updated*\n\n` +
                `*New number:* +${number}\n\n` +
                `> ᴄʜᴀɴɢᴇ ɪꜱ ʟɪᴠᴇ ɪᴍᴍᴇᴅɪᴀᴛᴇʟʏ ᴀɴᴅ ᴡɪʟʟ ᴘᴇʀꜱɪꜱᴛ ᴀꜰᴛᴇʀ ʀᴇꜱᴛᴀʀᴛ`
            );

        } catch (err) {
            console.error('[setnumber]', err.message);
            await send(sock, jid, global.mess.error);
        }
    }
};
