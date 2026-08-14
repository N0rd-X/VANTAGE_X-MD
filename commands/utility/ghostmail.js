const config = require('../../config');
const axios = require('axios');

module.exports = {
    name: 'ghostmail',
    aliases: ['ghost', 'burner'],
    category: 'utility',
    description: 'Generate an anonymous/ghost email',
    usage: `${config.prefix}ghostmail`,
    
    async execute(sock, msg, args) {
        try {
            const jid = msg.key.remoteJid;
            const wait = await sock.sendMessage(jid, { text: '👻 Summoning ghost mail...' });
            
            const domains = ['sharklasers.com', 'guerrillamail.net', 'spam4.me'];
            const user = Math.random().toString(36).substring(2, 12);
            const domain = domains[Math.floor(Math.random() * domains.length)];
            const email = `${user}@${domain}`;
            
            await sock.sendMessage(jid, {
                text: `👻 *Ghost Mail*\n\n\`${email}\`\n\nThis address self-destructs. Use it for one-time signups.`,
                edit: wait.key
            });
        } catch (error) {
            console.error('GhostMail error:', error.message);
            await sock.sendMessage(msg.key.remoteJid, { text: global.mess.error });
        }
    }
};