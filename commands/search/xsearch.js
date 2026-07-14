const config = require('../../config');
const axios = require('axios');

module.exports = {
    name: 'xsearch',
    aliases: ['twittersearch', 'tweetsearch'],
    category: 'search',
    description: 'Search X/Twitter',
    usage: `${config.prefix}xsearch <query>`,
    
    async execute(sock, msg, args) {
        try {
            const jid = msg.key.remoteJid;
            if (!args[0]) return await sock.sendMessage(jid, { text: `❌ Usage: ${this.usage}` });
            
            const query = args.join(' ');
            const wait = await sock.sendMessage(jid, { text: '🔍 Searching X...' });
            
            await sock.sendMessage(jid, {
                text: `𝕏 *Search: ${query}*\n\nhttps://x.com/search?q=${encodeURIComponent(query)}\n\n⚠️ X API v2 requires keys. Use a scraper for inline results.`,
                edit: wait.key
            });
        } catch (error) {
            console.error('XSearch error:', error.message);
            await sock.sendMessage(msg.key.remoteJid, { text: global.mess.error });
        }
    }
};