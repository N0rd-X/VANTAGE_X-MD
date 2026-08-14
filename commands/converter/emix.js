const config = require('../../config');

module.exports = {
    name: 'emix',
    aliases: ['emojimix', 'mixemoji'],
    category: 'converter',
    description: 'Mix two emojis',
    weight: 'heavy'
    usage: `${config.prefix}emix <emoji1> <emoji2>`,
    
    async execute(sock, msg, args) {
        try {
            const jid = msg.key.remoteJid;
            if (args.length < 2) {
                return await sock.sendMessage(jid, { text: `❌ Usage: ${this.usage}\n\nExample: ${config.prefix}emix 😂 😭` });
            }
            
            const e1 = encodeURIComponent(args[0]);
            const e2 = encodeURIComponent(args[1]);
            
            const url = `https://www.gstatic.com/android/keyboard/emojikitchen/20201001/u1f600/u1f600_u1f602.png`;
            
            await sock.sendMessage(jid, {
                image: { url: `https://emojik.vercel.app/s/${e1}_${e2}?size=256` },
                caption: `😀 Mixed: ${args[0]} + ${args[1]}`
            });
        } catch (error) {
            console.error('Emix error:', error.message);
            await sock.sendMessage(msg.key.remoteJid, { text: global.mess.error });
        }
    }
};