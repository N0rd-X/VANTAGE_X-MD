const config = require('../../config');

const symbols = ['🍒', '🍋', '🍇', '💎', '7️⃣', '🔔'];

module.exports = {
    name: 'slot',
    aliases: ['slots', 'spin'],
    category: 'fun',
    description: 'Play slot machine',
    usage: `${config.prefix}slot`,
    
    async execute(sock, msg, args) {
        try {
            const jid = msg.key.remoteJid;
            const spin = await sock.sendMessage(jid, { text: '🎰 Spinning...' });
            
            await new Promise(r => setTimeout(r, 1500));
            
            const r1 = symbols[Math.floor(Math.random() * symbols.length)];
            const r2 = symbols[Math.floor(Math.random() * symbols.length)];
            const r3 = symbols[Math.floor(Math.random() * symbols.length)];
            
            let result = `🎰 *SLOT MACHINE*\n\n| ${r1} | ${r2} | ${r3} |\n\n`;
            
            if (r1 === r2 && r2 === r3) {
                result += '🎉 JACKPOT! You win!';
            } else if (r1 === r2 || r2 === r3 || r1 === r3) {
                result += '✨ Nice! Two matching symbols!';
            } else {
                result += '💔 Better luck next time!';
            }
            
            await sock.sendMessage(jid, { text: result, edit: spin.key });
        } catch (error) {
            console.error('Slot error:', error.message);
            await sock.sendMessage(msg.key.remoteJid, { text: global.mess.error });
        }
    }
};