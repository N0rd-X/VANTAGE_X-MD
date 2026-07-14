const config = require('../../config');

const roasts = [
    "You're like a cloud. When you disappear, it's a beautiful day.",
    "I'm not saying I hate you, but I would unplug your life support to charge my phone.",
    "You're the reason the gene pool needs a lifeguard.",
    "If laughter is the best medicine, your face must be curing the world.",
    "You're not stupid; you just have bad luck thinking.",
    "I'd agree with you but then we'd both be wrong.",
    "You're like a software update. Whenever I see you, I think 'not now'.",
    "If I had a face like yours, I'd sue my parents.",
    "You're proof that evolution can go in reverse.",
    "I'm jealous of people who don't know you."
];

module.exports = {
    name: 'roast',
    aliases: ['burn', 'insult'],
    category: 'fun',
    description: 'Roast someone',
    usage: `${config.prefix}roast @user`,
    
    async execute(sock, msg, args) {
        try {
            const jid = msg.key.remoteJid;
            const mentioned = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid || [];
            const target = mentioned[0] || msg.key.participant || msg.key.remoteJid;
            const roast = roasts[Math.floor(Math.random() * roasts.length)];
            
            await sock.sendMessage(jid, {
                text: `🔥 @${target.split('@')[0]}, ${roast}`,
                mentions: [target]
            });
        } catch (error) {
            console.error('Roast error:', error.message);
            await sock.sendMessage(msg.key.remoteJid, { text: global.mess.error });
        }
    }
};