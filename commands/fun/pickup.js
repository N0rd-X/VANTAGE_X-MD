const config = require('../../config');

const lines = [
    'Are you a magician? Because whenever I look at you, everyone else disappears.',
    'Do you have a map? I keep getting lost in your eyes.',
    'Are you a WiFi signal? Because I feel a connection.',
    'Is your name Google? Because you have everything I am searching for.',
    'Are you a camera? Because every time I look at you, I smile.',
    'Do you have a Band-Aid? Because I scraped my knee falling for you.',
    'Are you a parking ticket? Because you have FINE written all over you.',
    'Is your dad a boxer? Because you are a knockout!',
    'Are you a loan? Because you have my interest.',
    'Do you like raisins? How do you feel about a date?'
];

module.exports = {
    name: 'pickup',
    aliases: ['pickupline', 'flirt'],
    category: 'fun',
    description: 'Get a pickup line',
    usage: `${config.prefix}pickup`,
    async execute(sock, msg, args) {
        try {
            const jid = msg.key.remoteJid;
            const line = lines[Math.floor(Math.random() * lines.length)];
            await sock.sendMessage(jid, { text: `💘 *Pickup Line*\n\n${line}` });
        } catch (e) { console.error(e.message); await sock.sendMessage(msg.key.remoteJid, { text: global.mess.error }); }
    }
};