const config = require('../../config');
const { evaluate } = require('mathjs');

module.exports = {
    name: 'calc',
    aliases: ['calculate', 'math'],
    category: 'utility',
    description: 'Calculate mathematical expressions',
    usage: `${config.prefix}calc <expression>`,
    
    async execute(sock, msg, args) {
        try {
            const jid = msg.key.remoteJid;
            
            if (!args[0]) {
                return await sock.sendMessage(jid, {
                    text: `❌ Usage: ${this.usage}\n\nExample: ${config.prefix}calc 2 + 2`
                });
            }
            
            const expression = args.join(' ');
            
            try {
                const result = evaluate(expression);
                
                await sock.sendMessage(jid, {
                    text: `🧮 **Calculator**\n\n` +
                          `**Input:** ${expression}\n` +
                          `**Result:** ${result}`
                });
                
            } catch (mathError) {
                await sock.sendMessage(jid, {
                    text: `❌ Invalid expression: ${expression}`
                });
            }
            
        } catch (error) {
            console.error('Calc error:', error);
            await sock.sendMessage(msg.key.remoteJid, {
                text: '❌ Error performing calculation'
            });
        }
    }
};