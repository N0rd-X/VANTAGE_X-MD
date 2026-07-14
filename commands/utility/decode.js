const config = require('../../config');

module.exports = {
    name: 'decode',
    aliases: ['dec'],
    category: 'utility',
    description: 'Decode base64, binary, or hex',
    usage: `${config.prefix}decode <base64|binary|hex> <text>`,
    async execute(sock, msg, args) {
        try {
            const jid = msg.key.remoteJid;
            if (args.length < 2) return await sock.sendMessage(jid, { text: `❌ Usage: ${this.usage}` });
            const type = args[0].toLowerCase();
            const text = args.slice(1).join(' ');
            let result;
            if (type === 'base64') result = Buffer.from(text, 'base64').toString('utf8');
            else if (type === 'hex') result = Buffer.from(text, 'hex').toString('utf8');
            else if (type === 'binary') result = text.split(' ').map(b => String.fromCharCode(parseInt(b, 2))).join('');
            else return await sock.sendMessage(jid, { text: '❌ Types: base64, hex, binary' });
            await sock.sendMessage(jid, { text: `🔢 *Decoded*\n\n${result}` });
        } catch (e) { console.error(e.message); await sock.sendMessage(msg.key.remoteJid, { text: '❌ Invalid input.' }); }
    }
};