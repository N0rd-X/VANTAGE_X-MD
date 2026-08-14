const config = require('../../config');

module.exports = {
    name: 'passgen',
    aliases: ['password', 'genpass'],
    category: 'utility',
    description: 'Generate a secure password',
    usage: `${config.prefix}passgen [length]`,
    
    async execute(sock, msg, args) {
        try {
            const jid = msg.key.remoteJid;
            const length = parseInt(args[0]) || 12;
            if (length < 4 || length > 64) {
                return await sock.sendMessage(jid, { text: '❌ Length must be between 4 and 64.' });
            }
            
            const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+~`|}{[]:;?><,./-=';
            let password = '';
            for (let i = 0; i < length; i++) {
                password += chars.charAt(Math.floor(Math.random() * chars.length));
            }
            
            await sock.sendMessage(jid, {
                text: `🔐 *Generated Password*\n\n\`\`\`${password}\`\`\`\n\nLength: ${length}`
            });
        } catch (error) {
            console.error('Passgen error:', error.message);
            await sock.sendMessage(msg.key.remoteJid, { text: global.mess.error });
        }
    }
};