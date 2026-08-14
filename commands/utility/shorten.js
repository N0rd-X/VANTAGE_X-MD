'use strict';
const config = require('../../config');
const axios  = require('axios');
const { send } = require('../../helpers');

module.exports = {
    name: 'shorten',
    aliases: ['shorturl', 'tinyurl'],
    category: 'utility',
    description: 'Shorten a URL',
    usage: `${config.prefix}shorten <url>`,

    async execute(sock, msg, args) {
        const jid = msg.key.remoteJid;
        try {
            if (!args[0]) return send(sock, jid, `❌ Usage: ${this.usage}\n\nExample: ${config.prefix}shorten https://google.com`);

            const url = args[0];
            const res = await axios.get('https://is.gd/create.php', {
                params:  { format: 'json', url },
                timeout: 6000,
            });

            if (res.data.shorturl) {
                await send(sock, jid, `🔗 *URL Shortened*\n\nOriginal: ${url}\nShort: ${res.data.shorturl}`);
            } else {
                await send(sock, jid, `❌ Failed to shorten URL: ${res.data.errormessage || 'unknown error'}`);
            }
        } catch (err) {
            console.error('[shorten]', err.message);
            await send(sock, jid, global.mess.error);
        }
    },
};
