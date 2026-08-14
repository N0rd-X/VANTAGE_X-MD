const config = require('../../config');

module.exports = {
    name: 'setvar',
    aliases: ['setenv', 'var'],
    category: 'owner',
    description: 'Set a config variable',
    usage: `${config.prefix}setvar <key> <value>`,
    ownerOnly: true,
    
    async execute(sock, msg, args) {
        try {
            const jid = msg.key.remoteJid;
            const sender = msg.key.participant || msg.key.remoteJid;
            const ownerJid = `${config.ownernumber}@s.whatsapp.net`;
            
            if (sender !== ownerJid) return await sock.sendMessage(jid, { text: '⛔ Owner only.' });
            if (args.length < 2) return await sock.sendMessage(jid, { text: `❌ Usage: ${this.usage}` });
            
            const key = args[0];
            const value = args.slice(1).join(' ');
            
            config[key] = value;
            await sock.sendMessage(jid, { text: `✅ Set ${key} = ${value}` });
        } catch (error) {
            console.error('SetVar error:', error.message);
            await sock.sendMessage(msg.key.remoteJid, { text: global.mess.error });
        }
    }
};