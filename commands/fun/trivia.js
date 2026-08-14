const config = require('../../config');
const axios = require('axios');

const activeGames = new Map();

module.exports = {
    name: 'trivia',
    aliases: ['quiz', 'question'],
    category: 'fun',
    description: 'Play a trivia quiz',
    usage: `${config.prefix}trivia`,
    
    async execute(sock, msg, args) {
        try {
            const jid = msg.key.remoteJid;
            const wait = await sock.sendMessage(jid, { text: '❓ Loading trivia...' });
            
            const res = await axios.get('https://opentdb.com/api.php?amount=1&type=multiple');
            const q = res.data.results[0];
            
            const answers = [...q.incorrect_answers, q.correct_answer].sort(() => Math.random() - 0.5);
            const correctIndex = answers.indexOf(q.correct_answer);
            
            activeGames.set(jid, { answer: correctIndex, correct: q.correct_answer });
            
            let text = `❓ *Trivia*\n\nCategory: ${q.category}\nDifficulty: ${q.difficulty}\n\n${decodeHtml(q.question)}\n\n`;
            answers.forEach((a, i) => {
                text += `${i + 1}. ${decodeHtml(a)}\n`;
            });
            
            text += `\nReply with the number (1-4)`;
            
            await sock.sendMessage(jid, { text, edit: wait.key });
        } catch (error) {
            console.error('Trivia error:', error.message);
            await sock.sendMessage(msg.key.remoteJid, { text: global.mess.error });
        }
    }
};

module.exports.answer = {
    name: 'answer',
    aliases: ['ans'],
    category: 'fun',
    usage: `${config.prefix}answer <1-4>`,
    
    async execute(sock, msg, args) {
        const jid = msg.key.remoteJid;
        const game = activeGames.get(jid);
        if (!game) return await sock.sendMessage(jid, { text: '❌ No active trivia. Start with !trivia' });
        
        const choice = parseInt(args[0]) - 1;
        if (isNaN(choice)) return await sock.sendMessage(jid, { text: '❌ Reply with a number 1-4.' });
        
        activeGames.delete(jid);
        
        if (choice === game.answer) {
            await sock.sendMessage(jid, { text: `✅ Correct! The answer was *${decodeHtml(game.correct)}*` });
        } else {
            await sock.sendMessage(jid, { text: `❌ Wrong! The correct answer was *${decodeHtml(game.correct)}*` });
        }
    }
};

function decodeHtml(html) {
    const entities = { '&quot;': '"', '&#039;': "'", '&amp;': '&', '&lt;': '<', '&gt;': '>' };
    return html.replace(/&quot;|&#039;|&amp;|&lt;|&gt;/g, match => entities[match]);
}