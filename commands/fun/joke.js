const config = require('../../config');
const axios = require('axios');

module.exports = {
    name: 'joke',
    aliases: ['jokes'],
    category: 'fun',
    description: 'Get a random joke',
    usage: `${config.prefix}joke`,
    async execute(sock, msg, args) {
        try {
            const jid = msg.key.remoteJid;
            const res = await axios.get('https://v2.jokeapi.dev/joke/Any?type=single');
            await sock.sendMessage(jid, { text: `😂 *Joke*\n\n${res.data.joke}` });
        } catch (e) { console.error(e.message); await sock.sendMessage(msg.key.remoteJid, { text: global.mess.error }); }
    }
};