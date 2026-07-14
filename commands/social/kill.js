const config = require('../../config');
const axios = require('axios');

module.exports = {
    name: 'kill',
    aliases: ['murder'],
    category: 'social',
    description: 'Kill someone (RP)',
    usage: `${config.prefix}kill @user`,
    
    async execute(sock, msg, args) {
        try {
            const jid = msg.key.remoteJid;
            const sender = msg.key.participant || msg.key.remoteJid;
            const mentioned = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid || [];
            
            if (!mentioned.length) return await sock.sendMessage(jid, { text: `❌ Mention someone! ${this.usage}` });
            
            const target = mentioned[0];
            
            await sock.sendMessage(jid, {
                text: `💀 @${sender.split('@')[0]} kills @${target.split('@')[0]}! F in chat.`,
                mentions: [sender, target]
            });
        } catch (error) {
            console.error('Kill error:', error.message);
            await sock.sendMessage(msg.key.remoteJid, { text: global.mess.error });
        }
    }
};