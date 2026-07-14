const config = require('../../config');

module.exports = {
    name: 'help',
    aliases: ['h', 'cmdinfo'],
    category: 'utility',
    description: 'Get details about a command',
    usage: `${config.prefix}help <command>`,
    
    async execute(sock, msg, args) {
        try {
            const jid = msg.key.remoteJid;
            if (!args[0]) {
                return await sock.sendMessage(jid, {
                    text: `❌ Usage: ${this.usage}\n\nExample: ${config.prefix}help chatgpt`
                });
            }
            
            const cmdName = args[0].toLowerCase();
            const commands = require('../../handler').commands || new Map();
            const cmd = commands.get(cmdName) || [...commands.values()].find(c => c.aliases?.includes(cmdName));
            
            if (!cmd) {
                return await sock.sendMessage(jid, { text: `❌ Command *${cmdName}* not found.` });
            }
            
            const text = `📖 *Command Help: ${cmd.name}*\n\n` +
                         `📝 Description: ${cmd.description}\n` +
                         `📂 Category: ${cmd.category}\n` +
                         `🔣 Aliases: ${cmd.aliases?.join(', ') || 'None'}\n` +
                         `💡 Usage: ${cmd.usage}\n` +
                         `${cmd.ownerOnly ? '⚠️ Owner Only: Yes' : ''}`;
            
            await sock.sendMessage(jid, { text });
        } catch (error) {
            console.error('Help error:', error.message);
            await sock.sendMessage(msg.key.remoteJid, { text: global.mess.error });
        }
    }
};