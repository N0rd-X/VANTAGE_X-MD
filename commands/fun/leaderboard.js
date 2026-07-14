const config = require('../../config');
const fs = require('fs');
const path = require('path');

const DB_PATH = path.join(__dirname, '../../database/leaderboard.json');

function loadDB() {
    try { return JSON.parse(fs.readFileSync(DB_PATH, 'utf8')); } catch { return {}; }
}
function saveDB(data) {
    fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
}

module.exports = {
    name: 'leaderboard',
    aliases: ['lb', 'top'],
    category: 'fun',
    description: 'Show group leaderboard',
    usage: `${config.prefix}leaderboard`,
    
    async execute(sock, msg, args) {
        try {
            const jid = msg.key.remoteJid;
            if (!jid.endsWith('@g.us')) return await sock.sendMessage(jid, { text: '❌ For groups only.' });
            
            const db = loadDB();
            const scores = db[jid] || {};
            
            const sorted = Object.entries(scores).sort((a, b) => b[1] - a[1]).slice(0, 10);
            
            if (!sorted.length) {
                return await sock.sendMessage(jid, { text: '🏆 No scores yet. Play games to earn points!' });
            }
            
            let text = `🏆 *Leaderboard*\n\n`;
            sorted.forEach(([user, score], i) => {
                const medal = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : '•';
                text += `${medal} @${user.split('@')[0]} — ${score} pts\n`;
            });
            
            await sock.sendMessage(jid, { text, mentions: sorted.map(s => s[0]) });
        } catch (error) {
            console.error('Leaderboard error:', error.message);
            await sock.sendMessage(msg.key.remoteJid, { text: global.mess.error });
        }
    }
};

module.exports.addPoints = (jid, user, points) => {
    const db = loadDB();
    if (!db[jid]) db[jid] = {};
    if (!db[jid][user]) db[jid][user] = 0;
    db[jid][user] += points;
    saveDB(db);
};