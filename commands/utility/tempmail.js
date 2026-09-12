const config = require('../../config');
const axios = require('axios');

module.exports = {
    name: 'tempmail',
    aliases: ['tmpmail', 'disposable'],
    category: 'utility',
    description: 'Generate a temporary email address',
    usage: `${config.prefix}tempmail`,
    
    async execute(sock, msg, args) {
        try {
            const jid = msg.key.remoteJid;
            const wait = await sock.sendMessage(jid, { text: '📧 Generating temp mail...' });
            
            // Using 1secmail API
            const domains = ['1secmail.com', '1secmail.org', '1secmail.net'];
            const login = Math.random().toString(36).substring(2, 10);
            const domain = domains[Math.floor(Math.random() * domains.length)];
            const email = `${login}@${domain}`;
            
            await sock.sendMessage(jid, {
                text: `📧 *Temporary Email*\n\nAddress: \`${email}\`\n\nUse ${config.prefix}checkmail ${email} to read inbox.`,
                edit: wait.key
            });
        } catch (error) {
            console.error('TempMail error:', error.message);
            await sock.sendMessage(msg.key.remoteJid, { text: global.mess.error });
        }
    }
};