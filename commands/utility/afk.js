const config = require('../../config');
const fs = require('fs');
const path = require('path');
const DB_PATH = path.join(__dirname, '../../database/afk.json');
const load = () => { try { return JSON.parse(fs.readFileSync(DB_PATH, 'utf8')); } catch { return {}; } };
const save = (d) => fs.writeFileSync(DB_PATH, JSON.stringify(d, null, 2));

module.exports = {
    name: 'afk',
    aliases: ['away', 'brb'],
    category: 'utility',
    description: 'Set AFK status',
    usage: `${config.prefix}afk [reason]`,
    async execute(sock, msg, args) {
        try {
            const jid = msg.key.remoteJid;
            const sender = msg.key.participant || msg.key.remoteJid;
            const db = load();
            db[sender] = { reason: args.join(' ') || 'AFK', time: Date.now() };
            save(db);
            await sock.sendMessage(jid, { text: `💤 @${sender.split('@')[0]} is now AFK: ${db[sender].reason}`, mentions: [sender] });
        } catch (e) { console.error(e.message); await sock.sendMessage(msg.key.remoteJid, { text: global.mess.error }); }
    }
};

module.exports.checkAfk = async (sock, msg) => {
    try {
        const jid = msg.key.remoteJid;
        const sender = msg.key.participant || msg.key.remoteJid;
        const db = load();
        if (db[sender]) { delete db[sender]; save(db); await sock.sendMessage(jid, { text: `🔔 Welcome back @${sender.split('@')[0]}!`, mentions: [sender] }); }
        const mentioned = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid || [];
        for (const m of mentioned) {
            if (db[m]) {
                const mins = Math.floor((Date.now() - db[m].time) / 60000);
                await sock.sendMessage(jid, { text: `💤 @${m.split('@')[0]} is AFK: ${db[m].reason} (${mins}m ago)`, mentions: [m] });
            }
        }
    } catch (e) { console.error(e.message); }
};