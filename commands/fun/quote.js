const config = require('../../config');
const axios = require('axios');

module.exports = {
    name: 'quote',
    aliases: ['q', 'randomquote'],
    category: 'fun',
    description: 'Get a random inspirational quote',
    usage: `${config.prefix}quote`,
    
    async execute(sock, msg, args) {
        try {
            const jid = msg.key.remoteJid;
            const res = await axios.get('https://api.quotable.io/random');
            const q = res.data;
            
            await sock.sendMessage(jid, {
                text: `💬 *Quote*\n\n"${q.content}"\n\n— ${q.author}`
            });
        } catch (error) {
            console.error('Quote error:', error.message);
            await sock.sendMessage(msg.key.remoteJid, { text: global.mess.error });
        }
    }
};