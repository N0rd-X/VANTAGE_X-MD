const config = require('../../config');
const fs = require('fs');
const path = require('path');
const DB_PATH = path.join(__dirname, '../../database/economy.json');
const load = () => { try { return JSON.parse(fs.readFileSync(DB_PATH, 'utf8')); } catch { return {}; } };
const save = (d) => fs.writeFileSync(DB_PATH, JSON.stringify(d, null, 2));

module.exports = {
    name: 'transfer',
    aliases: ['pay', 'send'],
    category: 'fun',
    description: 'Transfer money to another user',
    usage: `${config.prefix}transfer @user <amount>`,
    async execute(sock, msg, args) {
        try {
            const jid = msg.key.remoteJid;
            const sender = msg.key.participant || msg.key.remoteJid;
            const mentioned = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid || [];
            const target = mentioned[0] || (args[0]?.replace(/[^0-9]/g, '') + '@s.whatsapp.net');
            const amt = parseInt(args[1]) || parseInt(args[0]);
            if (!target || !amt || amt < 1) return await sock.sendMessage(jid, { text: `❌ Usage: ${this.usage}` });
            const db = load();
            if (!db[sender]) db[sender] = { wallet: 100, bank: 0, daily: 0 };
            if (!db[target]) db[target] = { wallet: 100, bank: 0, daily: 0 };
            if (db[sender].wallet < amt) return await sock.sendMessage(jid, { text: '❌ Not enough money.' });
            db[sender].wallet -= amt;
            db[target].wallet += amt;
            save(db);
            await sock.sendMessage(jid, { text: `💸 Sent $${amt} to @${target.split('@')[0]}\nYour wallet: $${db[sender].wallet}`, mentions: [target] });
        } catch (e) { console.error(e.message); await sock.sendMessage(msg.key.remoteJid, { text: global.mess.error }); }
    }
};