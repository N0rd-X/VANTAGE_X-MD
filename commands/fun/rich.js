const config = require('../../config');
const fs = require('fs');
const path = require('path');
const DB_PATH = path.join(__dirname, '../../database/economy.json');
const load = () => { try { return JSON.parse(fs.readFileSync(DB_PATH, 'utf8')); } catch { return {}; } };

module.exports = {
    name: 'rich',
    aliases: ['top', 'baltop', 'forbes'],
    category: 'fun',
    description: 'Top 10 richest users',
    usage: `${config.prefix}rich`,
    async execute(sock, msg, args) {
        try {
            const jid = msg.key.remoteJid;
            const db = load();
            const sorted = Object.entries(db).sort((a, b) => (b[1].wallet + b[1].bank) - (a[1].wallet + a[1].bank)).slice(0, 10);
            if (!sorted.length) return await sock.sendMessage(jid, { text: '💸 No one has money yet.' });
            let text = `🏆 *Richest Users*\n\n`;
            sorted.forEach(([u, d], i) => { text += `${i + 1}. @${u.split('@')[0]} — $${d.wallet + d.bank}\n`; });
            await sock.sendMessage(jid, { text, mentions: sorted.map(s => s[0]) });
        } catch (e) { console.error(e.message); await sock.sendMessage(msg.key.remoteJid, { text: global.mess.error }); }
    }
};