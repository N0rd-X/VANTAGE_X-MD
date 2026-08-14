const config = require('../../config');

module.exports = {
    name: 'mock',
    aliases: ['sarcasm', 'spongebob'],
    category: 'fun',
    description: 'Mock text with alternating caps',
    usage: `${config.prefix}mock <text>`,
    async execute(sock, msg, args) {
        try {
            const jid = msg.key.remoteJid;
            if (!args[0]) return await sock.sendMessage(jid, { text: `❌ Usage: ${this.usage}` });
            const text = args.join(' ');
            const mocked = text.split('').map((c, i) => i % 2 === 0 ? c.toLowerCase() : c.toUpperCase()).join('');
            await sock.sendMessage(jid, { text: `🗿 ${mocked}` });
        } catch (e) { console.error(e.message); await sock.sendMessage(msg.key.remoteJid, { text: global.mess.error }); }
    }
};