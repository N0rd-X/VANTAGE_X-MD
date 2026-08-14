const config = require('../../config');

module.exports = {
    name: 'readmore',
    aliases: ['spoiler', 'rm'],
    category: 'utility',
    description: 'Add readmore spoiler to text',
    usage: `${config.prefix}readmore <text>`,
    
    async execute(sock, msg, args) {
        try {
            const jid = msg.key.remoteJid;
            if (!args[0]) {
                return await sock.sendMessage(jid, {
                    text: `❌ Usage: ${this.usage}\n\nExample: ${config.prefix}readmore Hello World`
                });
            }
            
            const text = args.join(' ');
            const readmore = text.replace(/ /, '\u200E\n'.repeat(4000) + '\u200E ');
            
            await sock.sendMessage(jid, { text: readmore });
        } catch (error) {
            console.error('Readmore error:', error.message);
            await sock.sendMessage(msg.key.remoteJid, { text: global.mess.error });
        }
    }
};