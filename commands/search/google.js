const config = require('../../config');
const axios = require('axios');

module.exports = {
    name: 'google',
    aliases: ['g', 'search'],
    category: 'search',
    description: 'Search Google',
    usage: `${config.prefix}google <query>`,
    
    async execute(sock, msg, args) {
        try {
            const jid = msg.key.remoteJid;
            if (!args[0]) {
                return await sock.sendMessage(jid, {
                    text: `❌ Usage: ${this.usage}\n\nExample: ${config.prefix}google Node.js tutorials`
                });
            }
            
            const query = args.join(' ');
            const wait = await sock.sendMessage(jid, { text: '🔍 Googling...' });
            
            // DuckDuckGo as a free alternative
            const res = await axios.get(`https://api.duckduckgo.com/?q=${encodeURIComponent(query)}&format=json&no_html=1&skip_disambig=1`, {
                headers: { 'Accept': 'application/json' }
            });
            
            const topics = res.data?.RelatedTopics?.slice(0, 5);
            if (!topics?.length) {
                return await sock.sendMessage(jid, {
                    text: `❌ No results found for *${query}*.`,
                    edit: wait.key
                });
            }
            
            let text = `🔍 *Google Search: ${query}*\n\n`;
            topics.forEach((t, i) => {
                if (t.Text) text += `${i+1}. ${t.Text}\n${t.FirstURL}\n\n`;
            });
            
            await sock.sendMessage(jid, { text: text.trim(), edit: wait.key });
        } catch (error) {
            console.error('Google error:', error.message);
            await sock.sendMessage(msg.key.remoteJid, { text: global.mess.error });
        }
    }
};