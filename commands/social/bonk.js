const config = require('../../config');
const axios = require('axios');

module.exports = {
    name: 'bonk',
    aliases: ['bonks'],
    category: 'social',
    description: 'Bonk someone',
    usage: `${config.prefix}bonk @user`,
    
    async execute(sock, msg, args) {
        try {
            const jid = msg.key.remoteJid;
            const sender = msg.key.participant || msg.key.remoteJid;
            const mentioned = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid || [];
            
            if (!mentioned.length) return await sock.sendMessage(jid, { text: `❌ Mention someone! ${this.usage}` });
            
            const target = mentioned[0];
            const res = await axios.get('https://api.waifu.pics/sfw/bonk');
            
            await sock.sendMessage(jid, {
                video: { url: res.data.url },
                gifPlayback: true,
                caption: `🔨 @${sender.split('@')[0]} bonks @${target.split('@')[0]}! Go to horny jail.`,
                mentions: [sender, target]
            });
        } catch (error) {
            console.error('Bonk error:', error.message);
            await sock.sendMessage(msg.key.remoteJid, { text: global.mess.error });
        }
    }
};