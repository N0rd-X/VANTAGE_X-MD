const config = require('../../config');
const axios = require('axios');

module.exports = {
    name: 'checkmail',
    aliases: ['cm', 'mailcheck'],
    category: 'utility',
    description: 'Check temp mail inbox',
    usage: `${config.prefix}checkmail <email>`,
    
    async execute(sock, msg, args) {
        try {
            const jid = msg.key.remoteJid;
            if (!args[0]) return await sock.sendMessage(jid, { text: `❌ Usage: ${this.usage}` });
            
            const email = args[0];
            const wait = await sock.sendMessage(jid, { text: '📧 Checking inbox...' });
            
            const login = email.split('@')[0];
            const domain = email.split('@')[1];
            
            const res = await axios.get(`https://www.1secmail.com/api/v1/?action=getMessages&login=${login}&domain=${domain}`);
            const messages = res.data;
            
            if (!messages || !messages.length) {
                return await sock.sendMessage(jid, { text: '📭 No messages found.', edit: wait.key });
            }
            
            let text = `📧 *Inbox for ${email}*\n\n`;
            messages.forEach((m, i) => {
                text += `${i+1}. From: ${m.from}\nSubject: ${m.subject}\nDate: ${m.date}\n\n`;
            });
            
            await sock.sendMessage(jid, { text: text.trim(), edit: wait.key });
        } catch (error) {
            console.error('CheckMail error:', error.message);
            await sock.sendMessage(msg.key.remoteJid, { text: global.mess.error });
        }
    }
};