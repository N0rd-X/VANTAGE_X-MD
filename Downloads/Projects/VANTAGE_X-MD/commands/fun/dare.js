const config = require('../../config');

const dares = [
    'Send a funny selfie to the group.',
    'Text your crush "I love you".',
    'Do 20 pushups right now.',
    'Speak in an accent for the next 5 minutes.',
    'Let the group choose your profile picture for 1 hour.',
    'Send your last searched term on Google.',
    'Act like a chicken until your next turn.',
    'Call the 5th contact on your phone and sing Happy Birthday.',
    'Eat a spoonful of something spicy.',
    'Confess your biggest secret in voice note.'
];

module.exports = {
    name: 'dare',
    aliases: ['d'],
    category: 'fun',
    description: 'Get a dare',
    usage: `${config.prefix}dare`,
    async execute(sock, msg, args) {
        try {
            const jid = msg.key.remoteJid;
            const d = dares[Math.floor(Math.random() * dares.length)];
            await sock.sendMessage(jid, { text: `😈 *Dare*\n\n${d}` });
        } catch (e) { console.error(e.message); await sock.sendMessage(msg.key.remoteJid, { text: global.mess.error }); }
    }
};