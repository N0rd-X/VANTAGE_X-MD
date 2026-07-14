const config = require('../../config');
const fs = require('fs');
const path = require('path');
const DB_PATH = path.join(__dirname, '../../database/economy.json');
const load = () => { try { return JSON.parse(fs.readFileSync(DB_PATH, 'utf8')); } catch { return {}; } };
const save = (d) => fs.writeFileSync(DB_PATH, JSON.stringify(d, null, 2));

module.exports = {
    name: 'daily',
    aliases: ['claim', 'dailycoins'],
    category: 'fun',
    description: 'Claim daily reward',
    usage: `${config.prefix}daily`,
    async execute(sock, msg, args) {
        try {
            const jid = msg.key.remoteJid;
            const sender = msg.key.participant || msg.key.remoteJid;
            const db = load();
            if (!db[sender]) db[sender] = { wallet: 100, bank: 0, daily: 0 };
            const now = Date.now();
            const cooldown = 86400000;
            if (now - db[sender].daily < cooldown) {
                const hrs = Math.ceil((cooldown - (now - db[sender].daily)) / 3600000);
                return await sock.sendMessage(jid, { text: `⏳ Come back in ${hrs}h.` });
            }
            const reward = Math.floor(Math.random() * 500) + 100;
            db[sender].wallet += reward;
            db[sender].daily = now;
            save(db);
            await sock.sendMessage(jid, { text: `🎁 Daily reward: $${reward}!\n💵 Wallet: $${db[sender].wallet}` });
        } catch (e) { console.error(e.message); await sock.sendMessage(msg.key.remoteJid, { text: global.mess.error }); }
    }
};