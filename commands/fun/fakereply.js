const config = require('../../config');

module.exports = {
    name: 'fakereply',
    aliases: ['fake', 'quoteit', 'fakemsg'],
    category: 'fun',
    description: 'Create a fake quoted message',
    usage: `${config.prefix}fakereply @user <text>`,
    async execute(sock, msg, args) {
        try {
            const jid = msg.key.remoteJid;
            const mentioned = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid || [];
            const target = mentioned[0] || (args[0]?.replace(/[^0-9]/g, '') + '@s.whatsapp.net');
            if (!target || !args[1]) return await sock.sendMessage(jid, { text: `❌ Usage: ${this.usage}` });
            const text = args.slice(mentioned.length ? 0 : 1).join(' ');
            // Simulate a fake reply by sending a message with quoted context
            await sock.sendMessage(jid, {
                text: text,
                contextInfo: {
                    stanzaId: '3EB0' + Math.random().toString(36).substring(2, 15),
                    participant: target,
                    quotedMessage: { conversation: text }
                }
            });
            // Better approach: send a real-looking quote
            await sock.sendMessage(jid, {
                text: `_${text}_\n— @${target.split('@')[0]}`,
                mentions: [target]
            });
        } catch (e) { console.error(e.message); await sock.sendMessage(msg.key.remoteJid, { text: global.mess.error }); }
    }
};