const config = require('../../config');
const fs = require('fs');
const path = require('path');

const CONFIG_PATH = path.join(__dirname, '../../config.js');

module.exports = {
    name: 'setprefix',
    aliases: ['prefix'],
    category: 'owner',
    description: 'Change bot prefix',
    usage: `${config.prefix}setprefix <new_prefix>`,
    ownerOnly: true,
    
    async execute(sock, msg, args) {
        try {
            const jid = msg.key.remoteJid;
            const sender = msg.key.participant || msg.key.remoteJid;
            const ownerJid = `${config.ownernumber}@s.whatsapp.net`;
            
            if (sender !== ownerJid) return await sock.sendMessage(jid, { text: '⛔ Owner only.' });
            if (!args[0]) return await sock.sendMessage(jid, { text: `❌ Usage: ${this.usage}` });
            
            const newPrefix = args[0];
            
            config.prefix = newPrefix;
            await sock.sendMessage(jid, { text: `✅ Prefix changed to: ${newPrefix}` });
        } catch (error) {
            console.error('SetPrefix error:', error.message);
            await sock.sendMessage(msg.key.remoteJid, { text: global.mess.error });
        }
    }
};