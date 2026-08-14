const config = require('../../config');
const axios = require('axios');

module.exports = {
    name: 'urbandict',
    aliases: ['urban', 'ud'],
    category: 'search',
    description: 'Search Urban Dictionary',
    usage: `${config.prefix}urbandict <term>`,
    
    async execute(sock, msg, args) {
        try {
            const jid = msg.key.remoteJid;
            if (!args[0]) {
                return await sock.sendMessage(jid, {
                    text: `❌ Usage: ${this.usage}\n\nExample: ${config.prefix}urbandict pog`
                });
            }
            
            const term = args.join(' ');
            const wait = await sock.sendMessage(jid, { text: '🔍 Searching Urban Dictionary...' });
            
            const res = await axios.get(`https://api.urbandictionary.com/v0/define?term=${encodeURIComponent(term)}`);
            const defs = res.data?.list;
            
            if (!defs?.length) {
                return await sock.sendMessage(jid, {
                    text: `❌ No Urban Dictionary results for *${term}*.`,
                    edit: wait.key
                });
            }
            
            const d = defs[0];
            const definition = d.definition.replace(/\[|\]/g, '').substring(0, 800);
            const example = d.example.replace(/\[|\]/g, '').substring(0, 400);
            
            await sock.sendMessage(jid, {
                text: `📖 *Urban Dictionary: ${d.word}*\n\n` +
                      `*Definition:*\n${definition}\n\n` +
                      `*Example:*\n_${example}_\n\n` +
                      `👍 ${d.thumbs_up} | 👎 ${d.thumbs_down}`,
                edit: wait.key
            });
        } catch (error) {
            console.error('Urbandict error:', error.message);
            await sock.sendMessage(msg.key.remoteJid, { text: global.mess.error });
        }
    }
};