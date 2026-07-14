const config = require('../../config');

const truths = [
    'What is your biggest fear?',
    'Have you ever lied to your best friend?',
    'What is the most embarrassing thing you have done?',
    'Who was your first crush?',
    'Have you ever cheated on a test?',
    'What is your worst habit?',
    'What secret are you hiding from your parents?',
    'Have you ever been rejected?',
    'What is the craziest thing you have done?',
    'Who in this group would you date?'
];

module.exports = {
    name: 'truth',
    aliases: ['t'],
    category: 'fun',
    description: 'Get a truth question',
    usage: `${config.prefix}truth`,
    async execute(sock, msg, args) {
        try {
            const jid = msg.key.remoteJid;
            const q = truths[Math.floor(Math.random() * truths.length)];
            await sock.sendMessage(jid, { text: `🎭 *Truth*\n\n${q}` });
        } catch (e) { console.error(e.message); await sock.sendMessage(msg.key.remoteJid, { text: global.mess.error }); }
    }
};