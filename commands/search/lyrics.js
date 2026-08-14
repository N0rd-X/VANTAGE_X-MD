const config = require('../../config');
const axios = require('axios');

module.exports = {
    name: 'lyrics',
    aliases: ['lyric', 'songtext'],
    category: 'search',
    description: 'Get song lyrics',
    usage: `${config.prefix}lyrics <song name>`,
    
    async execute(sock, msg, args) {
        try {
            const jid = msg.key.remoteJid;
            if (!args[0]) {
                return await sock.sendMessage(jid, {
                    text: `❌ Usage: ${this.usage}\n\nExample: ${config.prefix}lyrics Bohemian Rhapsody`
                });
            }
            
            const query = args.join(' ');
            const wait = await sock.sendMessage(jid, { text: '🎵 Fetching lyrics...' });
            
            const res = await axios.get(`https://api.lyrics.ovh/v1/${encodeURIComponent(query)}`);
            const lyrics = res.data?.lyrics || 'Lyrics not found.';
            
            // Trim if too long
            const trimmed = lyrics.length > 3000 ? lyrics.substring(0, 3000) + '...' : lyrics;
            
            await sock.sendMessage(jid, {
                text: `🎵 *Lyrics: ${query}*\n\n${trimmed}`,
                edit: wait.key
            });
        } catch (error) {
            console.error('Lyrics error:', error.message);
            await sock.sendMessage(msg.key.remoteJid, { text: global.mess.error });
        }
    }
};