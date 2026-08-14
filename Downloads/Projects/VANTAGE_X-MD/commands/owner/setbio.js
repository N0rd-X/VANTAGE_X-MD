const config = require('../../config');

module.exports = {
    name: 'setbio',
    aliases: ['setstatus', 'bio'],
    category: 'owner',
    description: 'Set bot status/bio',
    usage: `${config.prefix}setbio <text>`,
    ownerOnly: true,
    
    async execute(sock, msg, args) {
        try {
            const jid = msg.key.remoteJid;
            const sender = msg.key.participant || msg.key.remoteJid;
            const ownerJid = `${config.ownernumber}@s.whatsapp.net`;
            
            if (sender !== ownerJid) return await sock.sendMessage(jid, { text: '⛔ Owner only.' });
            if (!args[0]) return await sock.sendMessage(jid, { text: `❌ Usage: ${this.usage}` });
            
            const bio = args.join(' ');
            await sock.updateProfileStatus(bio);
            await sock.sendMessage(jid, { text: `✅ Bio updated to: ${bio}` });
        } catch (error) {
            console.error('SetBio error:', error.message);
            await sock.sendMessage(msg.key.remoteJid, { text: global.mess.error });
        }
    }
};