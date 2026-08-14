const config = require('../../config');
const fs = require('fs');
const path = require('path');
const DB_PATH = path.join(__dirname, '../../database/xp.json');
const load = () => { try { return JSON.parse(fs.readFileSync(DB_PATH, 'utf8')); } catch { return {}; } };
const save = (d) => fs.writeFileSync(DB_PATH, JSON.stringify(d, null, 2));

module.exports = {
    name: 'rank',
    aliases: ['level', 'xp', 'card'],
    category: 'fun',
    description: 'Check your rank and level',
    usage: `${config.prefix}rank [@user]`,
    async execute(sock, msg, args) {
        try {
            const jid = msg.key.remoteJid;
            const sender = msg.key.participant || msg.key.remoteJid;
            const mentioned = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid || [];
            const target = mentioned[0] || sender;
            const db = load();
            if (!db[jid]) db[jid] = {};
            if (!db[jid][target]) db[jid][target] = { xp: 0, level: 1, messages: 0 };
            const u = db[jid][target];
            const next = u.level * 150;
            const bar = '█'.repeat(Math.floor((u.xp / next) * 10)) + '░'.repeat(10 - Math.floor((u.xp / next) * 10));
            await sock.sendMessage(jid, { text: `🎖️ *Rank Card*\n\n👤 @${target.split('@')[0]}\n🏆 Level: ${u.level}\n✨ XP: ${u.xp} / ${next}\n📊 ${bar}\n💬 Messages: ${u.messages}`, mentions: [target] });
        } catch (e) { console.error(e.message); await sock.sendMessage(msg.key.remoteJid, { text: global.mess.error }); }
    }
};

module.exports.addXp = (jid, user) => {
    const db = load();
    if (!db[jid]) db[jid] = {};
    if (!db[jid][user]) db[jid][user] = { xp: 0, level: 1, messages: 0 };
    db[jid][user].messages++;
    db[jid][user].xp += Math.floor(Math.random() * 10) + 5;
    const needed = db[jid][user].level * 150;
    if (db[jid][user].xp >= needed) { db[jid][user].level++; db[jid][user].xp -= needed; }
    save(db);
};