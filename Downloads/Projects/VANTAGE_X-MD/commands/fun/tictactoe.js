const config = require('../../config');

const games = new Map();

module.exports = {
    name: 'tictactoe',
    aliases: ['ttt', 'xo'],
    category: 'fun',
    description: 'Play Tic Tac Toe',
    usage: `${config.prefix}tictactoe @user`,
    
    async execute(sock, msg, args) {
        try {
            const jid = msg.key.remoteJid;
            if (!jid.endsWith('@g.us')) return await sock.sendMessage(jid, { text: '❌ This game is for groups only.' });
            
            const sender = msg.key.participant || msg.key.remoteJid;
            const mentioned = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid || [];
            
            if (!mentioned.length) {
                return await sock.sendMessage(jid, { text: `❌ Mention an opponent!\n${this.usage}` });
            }
            
            const opponent = mentioned[0];
            if (opponent === sender) return await sock.sendMessage(jid, { text: '❌ You cannot play against yourself.' });
            
            const gameId = jid;
            games.set(gameId, {
                board: ['1','2','3','4','5','6','7','8','9'],
                players: [sender, opponent],
                current: 0,
                active: true
            });
            
            const game = games.get(gameId);
            const boardText = renderBoard(game.board);
            
            await sock.sendMessage(jid, {
                text: `🎮 *Tic Tac Toe*\n\n@${sender.split('@')[0]} ❌ vs @${opponent.split('@')[0]} ⭕\n\n${boardText}\n\nUse ${config.prefix}move <1-9>`,
                mentions: [sender, opponent]
            });
        } catch (error) {
            console.error('TicTacToe error:', error.message);
            await sock.sendMessage(msg.key.remoteJid, { text: global.mess.error });
        }
    }
};

module.exports.move = {
    name: 'move',
    aliases: ['playmove'],
    category: 'fun',
    description: 'Make a move in Tic Tac Toe',
    usage: `${config.prefix}move <1-9>`,
    
    async execute(sock, msg, args) {
        const jid = msg.key.remoteJid;
        const game = games.get(jid);
        if (!game || !game.active) return await sock.sendMessage(jid, { text: '❌ No active game. Start with !tictactoe' });
        
        const sender = msg.key.participant || msg.key.remoteJid;
        if (game.players[game.current] !== sender) return await sock.sendMessage(jid, { text: '❌ Not your turn!' });
        
        const pos = parseInt(args[0]) - 1;
        if (isNaN(pos) || pos < 0 || pos > 8 || game.board[pos] === '❌' || game.board[pos] === '⭕') {
            return await sock.sendMessage(jid, { text: '❌ Invalid move. Use 1-9 on an empty cell.' });
        }
        
        game.board[pos] = game.current === 0 ? '❌' : '⭕';
        
        if (checkWin(game.board)) {
            game.active = false;
            games.delete(jid);
            return await sock.sendMessage(jid, {
                text: `🎉 *Game Over!*\n\n${renderBoard(game.board)}\n\n@${sender.split('@')[0]} wins!`,
                mentions: [sender]
            });
        }
        
        if (game.board.every(c => c === '❌' || c === '⭕')) {
            game.active = false;
            games.delete(jid);
            return await sock.sendMessage(jid, { text: `🤝 *Draw!*\n\n${renderBoard(game.board)}` });
        }
        
        game.current = game.current === 0 ? 1 : 0;
        const nextPlayer = game.players[game.current];
        
        await sock.sendMessage(jid, {
            text: `🎮 *Tic Tac Toe*\n\n${renderBoard(game.board)}\n\n@${nextPlayer.split('@')[0]}'s turn (${game.current === 0 ? '❌' : '⭕'})`,
            mentions: [nextPlayer]
        });
    }
};

function renderBoard(board) {
    return `${board[0]} │ ${board[1]} │ ${board[2]}\n───┼───┼───\n${board[3]} │ ${board[4]} │ ${board[5]}\n───┼───┼───\n${board[6]} │ ${board[7]} │ ${board[8]}`;
}

function checkWin(board) {
    const wins = [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];
    return wins.some(([a,b,c]) => board[a] === board[b] && board[b] === board[c] && (board[a] === '❌' || board[a] === '⭕'));
}