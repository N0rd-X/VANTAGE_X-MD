const config = require('../../config');

const colors = ['🔴 Red', '⚫ Black', '🟢 Green'];

module.exports = {
    name: 'roulette',
    aliases: ['rl', 'spinwheel'],
    category: 'fun',
    description: 'Play roulette',
    usage: `${config.prefix}roulette <red|black|green>`,
    
    async execute(sock, msg, args) {
        try {
            const jid = msg.key.remoteJid;
            if (!args[0]) {
                return await sock.sendMessage(jid, {
                    text: `❌ Usage: ${this.usage}\n\nBets: red, black, green`
                });
            }
            
            const bet = args[0].toLowerCase();
            if (!['red', 'black', 'green'].includes(bet)) {
                return await sock.sendMessage(jid, { text: '❌ Bet on red, black, or green.' });
            }
            
            const spin = await sock.sendMessage(jid, { text: '🎰 Spinning roulette...' });
            await new Promise(r => setTimeout(r, 2000));
            
            const result = Math.random();
            let winner;
            if (result < 0.45) winner = 'red';
            else if (result < 0.90) winner = 'black';
            else winner = 'green';
            
            const colorText = winner === 'red' ? '🔴 Red' : winner === 'black' ? '⚫ Black' : '🟢 Green';
            const win = bet === winner;
            
            await sock.sendMessage(jid, {
                text: `🎰 *Roulette*\n\nResult: ${colorText}\nYou bet: ${bet}\n\n${win ? '🎉 You win!' : '💔 You lose!'}`,
                edit: spin.key
            });
        } catch (error) {
            console.error('Roulette error:', error.message);
            await sock.sendMessage(msg.key.remoteJid, { text: global.mess.error });
        }
    }
};