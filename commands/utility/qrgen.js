const config = require('../../config');

module.exports = {
    name: 'qrgen',
    aliases: ['qrcode', 'qr'],
    category: 'utility',
    description: 'Generate a QR code',
    usage: `${config.prefix}qrgen <text>`,
    
    async execute(sock, msg, args) {
        try {
            const jid = msg.key.remoteJid;
            if (!args[0]) {
                return await sock.sendMessage(jid, {
                    text: `❌ Usage: ${this.usage}\n\nExample: ${config.prefix}qrgen https://google.com`
                });
            }
            
            const text = args.join(' ');
            const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(text)}`;
            
            await sock.sendMessage(jid, {
                image: { url: qrUrl },
                caption: `📱 QR Code for:\n${text}`
            });
        } catch (error) {
            console.error('QRGen error:', error.message);
            await sock.sendMessage(msg.key.remoteJid, { text: global.mess.error });
        }
    }
};