const messageStyle = require('../../lib/messageStyle');
const config = require('../../config');
const util = require('util');

module.exports = {
    name: 'eval',
    aliases: ['exec', 'run', '>'],
    category: 'owner',
    description: 'Execute JavaScript code (Owner only)',
    usage: `${config.prefix}eval <code>`,
    ownerOnly: true,
    
    async execute(sock, msg, args) {
        try {
            const jid = msg.key.remoteJid;
            const sender = msg.key.participant || msg.key.remoteJid;
            const ownerJid = `${config.ownernumber}@s.whatsapp.net`;
            
            // Check if sender is owner
            if (sender !== ownerJid) {
                return await sock.sendMessage(jid, {
                    text: '⛔ This command is restricted to the bot owner only.'
                });
            }
            
            if (!args.length) {
                return await sock.sendMessage(jid, {
                    text: `❌ Usage: ${config.prefix}eval <code>\n\nExample: ${config.prefix}eval 2 + 2`
                });
            }
            
            const code = args.join(' ');
            
            try {
                // Execute the code
                let result = await eval(code);
                
                // Format result
                if (typeof result !== 'string') {
                    result = util.inspect(result, { depth: 2 });
                }
                
                // Limit result length
                if (result.length > 2000) {
                    result = result.substring(0, 2000) + '... (truncated)';
                }
                
                // Send with terminal styling (Like Xlicon ABZTech Exec)
                await messageStyle.sendEvalResult(sock, jid, code, result, false);
                
            } catch (error) {
                // Error in code execution
                await messageStyle.sendEvalResult(sock, jid, code, error.message, true);
            }
            
        } catch (error) {
            console.error('Eval command error:', error);
            await sock.sendMessage(msg.key.remoteJid, {
                text: `❌ Error: ${error.message}`
            });
        }
    }
};