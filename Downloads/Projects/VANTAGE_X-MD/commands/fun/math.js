const config = require('../../config');

const games = new Map();

module.exports = {
    name: 'math',
    aliases: ['mathgame', 'quickmath'],
    category: 'fun',
    description: 'Quick math challenge',
    usage: `${config.prefix}math`,
    
    async execute(sock, msg, args) {
        try {
            const jid = msg.key.remoteJid;
            const sender = msg.key.participant || msg.key.remoteJid;
            
            const ops = ['+', '-', '*'];
            const op = ops[Math.floor(Math.random() * ops.length)];
            const a = Math.floor(Math.random() * 20) + 1;
            const b = Math.floor(Math.random() * 20) + 1;
            let answer;
            
            switch(op) {
                case '+': answer = a + b; break;
                case '-': answer = a - b; break;
                case '*': answer = a * b; break;
            }
            
            games.set(`${jid}_${sender}`, { answer, time: Date.now() });
            
            await sock.sendMessage(jid, {
                text: `🧮 *Math Challenge*\n\nWhat is ${a} ${op} ${b}?\n\nReply with the answer!`
            });
        } catch (error) {
            console.error('Math error:', error.message);
            await sock.sendMessage(msg.key.remoteJid, { text: global.mess.error });
        }
    }
};

module.exports.checkAnswer = async (sock, msg, text) => {
    const jid = msg.key.remoteJid;
    const sender = msg.key.participant || msg.key.remoteJid;
    const game = games.get(`${jid}_${sender}`);
    
    if (!game) return false;
    if (Date.now() - game.time > 30000) {
        games.delete(`${jid}_${sender}`);
        return false;
    }
    
    const guess = parseInt(text);
    if (isNaN(guess)) return false;
    
    games.delete(`${jid}_${sender}`);
    
    if (guess === game.answer) {
        await sock.sendMessage(jid, { text: `✅ Correct! The answer was ${game.answer}.` });
    } else {
        await sock.sendMessage(jid, { text: `❌ Wrong! The answer was ${game.answer}.` });
    }
    return true;
};