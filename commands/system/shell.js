const config = require('../../config');
const { exec } = require('child_process');
const { promisify } = require('util');
const execPromise = promisify(exec);

module.exports = {
    name: 'shell',
    aliases: ['term', 'terminal', '$'],
    category: 'owner',
    description: 'Execute shell commands',
    usage: `${config.prefix}shell <command>`,
    ownerOnly: true,
    
    async execute(sock, msg, args) {
        try {
            const jid = msg.key.remoteJid;
            const sender = msg.key.participant || msg.key.remoteJid;
            const ownerJid = `${config.ownernumber}@s.whatsapp.net`;
            
            if (sender !== ownerJid) {
                return await sock.sendMessage(jid, { text: '⛔ Owner only.' });
            }
            
            if (!args[0]) {
                return await sock.sendMessage(jid, { text: `❌ Usage: ${this.usage}` });
            }
            
            const command = args.join(' ');
            const wait = await sock.sendMessage(jid, { text: '💻 Executing...' });
            
            const { stdout, stderr } = await execPromise(command, { timeout: 30000 });
            const output = stdout || stderr || 'No output';
            const trimmed = output.length > 3000 ? output.substring(0, 3000) + '...' : output;
            
            await sock.sendMessage(jid, {
                text: `💻 *Shell Output*\n\n\`\`\`${trimmed}\`\`\``,
                edit: wait.key
            });
        } catch (error) {
            console.error('Shell error:', error.message);
            await sock.sendMessage(msg.key.remoteJid, {
                text: `❌ Error: ${error.message.substring(0, 500)}`
            });
        }
    }
};