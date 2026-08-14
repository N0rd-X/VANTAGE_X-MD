const config = require('../../config');
const fs = require('fs');
const path = require('path');
const DB_PATH = path.join(__dirname, '../../database/economy.json');
const load = () => { try { return JSON.parse(fs.readFileSync(DB_PATH, 'utf8')); } catch { return {}; } };
const save = (d) => fs.writeFileSync(DB_PATH, JSON.stringify(d, null, 2));

module.exports = {
    name: 'gamble',
    aliases: ['bet', 'roll'],
    category: 'fun',
    description: 'Gamble your money',
    usage: `${config.prefix}gamble <amount>`,
    async execute(sock, msg, args) {
        try {
            const jid = msg.key.remoteJid;
            const sender = msg.key.participant || msg.key.remoteJid;
            const db = load();
            if (!db[sender]) db[sender] = { wallet: 100, bank: 0, daily: 0 };
            const amt = parseInt(args[0]);
            if (!amt || amt < 1) return await sock.sendMessage(jid, { text: `❌ Usage: ${this.usage}` });
            if (db[sender].wallet < amt) return await sock.sendMessage(jid, { text: '❌ Not enough money.' });
            const win = Math.random() < 0.45;
            if (win) { db[sender].wallet += amt; save(db); return await sock.sendMessage(jid, { text: `🎉 You won $${amt}!\n💵 Wallet: $${db[sender].wallet}` }); }
            else { db[sender].wallet -= amt; save(db); return await sock.sendMessage(jid, { text: `💔 You lost $${amt}.\n💵 Wallet: $${db[sender].wallet}` }); }
        } catch (e) { console.error(e.message); await sock.sendMessage(msg.key.remoteJid, { text: global.mess.error }); }
    }
};