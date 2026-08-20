const config = require('../../config');

module.exports = {
    name: 'join',
    aliases: ['joingroup'],
    category: 'owner',
    description: 'Join a group via invite link',
    usage: `${config.prefix}join <invite link>`,
    ownerOnly: true,
    
    async execute(sock, msg, args) {
        try {
            const jid = msg.key.remoteJid;
            if (await ownerGuard(sock, msg)) return;
            if (!args[0]) return await sock.sendMessage(jid, { text: `❌ Usage: ${this.usage}` });
            
            const link = args[0];
            const code = link.match(/chat.whatsapp.com\/([a-zA-Z0-9]+)/)?.[1];
            
            if (!code) return await sock.sendMessage(jid, { text: '❌ Invalid invite link.' });
            
            const response = await sock.groupAcceptInvite(code);
            await sock.sendMessage(jid, { text: `✅ Joined group: ${response}` });
        } catch (error) {
            console.error('Join error:', error.message);
            await sock.sendMessage(msg.key.remoteJid, { text: '❌ Failed to join group.' });
        }
    }
};