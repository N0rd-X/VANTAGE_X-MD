const config = require('../../config');

module.exports = {
    name: 'encode',
    aliases: ['enc'],
    category: 'utility',
    description: 'Encode text to base64, binary, or hex',
    usage: `${config.prefix}encode <base64|binary|hex> <text>`,
    async execute(sock, msg, args) {
        try {
            const jid = msg.key.remoteJid;
            if (args.length < 2) return await sock.sendMessage(jid, { text: `❌ Usage: ${this.usage}` });
            const type = args[0].toLowerCase();
            const text = args.slice(1).join(' ');
            let result;
            if (type === 'base64') result = Buffer.from(text).toString('base64');
            else if (type === 'hex') result = Buffer.from(text).toString('hex');
            else if (type === 'binary') result = text.split('').map(c => c.charCodeAt(0).toString(2).padStart(8, '0')).join(' ');
            else return await sock.sendMessage(jid, { text: '❌ Types: base64, hex, binary' });
            await sock.sendMessage(jid, { text: `🔢 *${type.toUpperCase()}*\n\n\`\`\`${result}\`\`\`` });
        } catch (e) { console.error(e.message); await sock.sendMessage(msg.key.remoteJid, { text: global.mess.error }); }
    }
};