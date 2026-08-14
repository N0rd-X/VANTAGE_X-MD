const config = require('../../config');
const axios = require('axios');

module.exports = {
    name: 'ttsearch',
    aliases: ['tiktoksearch', 'tts'],
    category: 'search',
    description: 'Search TikTok videos',
    usage: `${config.prefix}ttsearch <query>`,
    
    async execute(sock, msg, args) {
        try {
            const jid = msg.key.remoteJid;
            if (!args[0]) return await sock.sendMessage(jid, { text: `❌ Usage: ${this.usage}` });
            
            const query = args.join(' ');
            const wait = await sock.sendMessage(jid, { text: '🔍 Searching TikTok...' });
            
            await sock.sendMessage(jid, {
                text: `🎵 *TikTok Search: ${query}*\n\nResults:\nhttps://www.tiktok.com/search?q=${encodeURIComponent(query)}\n\n⚠️ Integrate a TikTok scraping API for inline results.`,
                edit: wait.key
            });
        } catch (error) {
            console.error('TTSearch error:', error.message);
            await sock.sendMessage(msg.key.remoteJid, { text: global.mess.error });
        }
    }
};