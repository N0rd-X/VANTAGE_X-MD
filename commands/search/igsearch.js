const config = require('../../config');
const axios = require('axios');

module.exports = {
    name: 'igsearch',
    aliases: ['instasearch', 'igs'],
    category: 'search',
    description: 'Search Instagram profiles',
    usage: `${config.prefix}igsearch <username>`,
    
    async execute(sock, msg, args) {
        try {
            const jid = msg.key.remoteJid;
            if (!args[0]) return await sock.sendMessage(jid, { text: `❌ Usage: ${this.usage}` });
            
            const username = args[0].replace('@', '');
            const wait = await sock.sendMessage(jid, { text: '🔍 Searching Instagram...' });
            
            await sock.sendMessage(jid, {
                text: `📸 *Instagram Search: @${username}*\n\nProfile: https://instagram.com/${username}\n\n⚠️ Integrate a scraping API for profile stats.`,
                edit: wait.key
            });
        } catch (error) {
            console.error('IGSearch error:', error.message);
            await sock.sendMessage(msg.key.remoteJid, { text: global.mess.error });
        }
    }
};