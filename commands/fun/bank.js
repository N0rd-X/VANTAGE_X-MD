const config = require('../../config');
const fs = require('fs');
const path = require('path');
const DB_PATH = path.join(__dirname, '../../database/economy.json');
const load = () => { try { return JSON.parse(fs.readFileSync(DB_PATH, 'utf8')); } catch { return {}; } };
const save = (d) => fs.writeFileSync(DB_PATH, JSON.stringify(d, null, 2));

module.exports = {
    name: 'bank',
    aliases: ['bal', 'balance', 'money'],
    category: 'fun',
    description: 'Check your balance',
    usage: `${config.prefix}bank`,
    async execute(sock, msg, args) {
        try {
            const jid = msg.key.remoteJid;
            const sender = msg.key.participant || msg.key.remoteJid;
            const db = load();
            if (!db[sender]) db[sender] = { wallet: 100, bank: 0, daily: 0 };
            const u = db[sender];
            await sock.sendMessage(jid, { text: `🏦 @${sender.split('@')[0]}\n\n💵 Wallet: $${u.wallet}\n🏛️ Bank: $${u.bank}\n📊 Total: $${u.wallet + u.bank}`, mentions: [sender] });
        } catch (e) { console.error(e.message); await sock.sendMessage(msg.key.remoteJid, { text: global.mess.error }); }
    }
};