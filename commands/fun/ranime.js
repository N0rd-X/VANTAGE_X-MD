'use strict';

const config = require('../../config');
const axios  = require('axios');
const { send } = require('../../helpers');

module.exports = {
    name: 'ranime',
    aliases: ['animepic', 'randomanime'],
    category: 'fun',
    description: 'Get a random anime image',
    usage: `${config.prefix}ranime`,

    async execute(sock, msg, args) {
        const jid = msg.key.remoteJid;
        try {
            const res = await axios.get('https://api.waifu.pics/sfw/waifu', { timeout: 10_000 });
            const url = res.data?.url;

            if (!url) return send(sock, jid, '❌ Could not fetch an anime image. Try again.');

            await sock.sendMessage(jid, {
                image:   { url },
                caption: '✨ *Random Anime*'
            }, { quoted: msg });

        } catch (err) {
            console.error('[ranime]', err.message);
            await send(sock, jid, global.mess.error);
        }
    }
};
