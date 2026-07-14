const config = require('../../config');

module.exports = {
    name: 'dice',
    aliases: ['roll', 'diceroll'],
    category: 'fun',
    description: 'Roll a dice',
    usage: `${config.prefix}dice`,
    
    async execute(sock, msg, args) {
        try {
            const jid = msg.key.remoteJid;
            const result = Math.floor(Math.random() * 6) + 1;
            const diceEmojis = ['⚀', '⚁', '⚂', '⚃', '⚄', '⚅'];
            
            await sock.sendMessage(jid, {
                text: `🎲 You rolled a ${result} ${diceEmojis[result - 1]}`
            });
        } catch (error) {
            console.error('Dice error:', error.message);
            await sock.sendMessage(msg.key.remoteJid, { text: global.mess.error });
        }
    }
};