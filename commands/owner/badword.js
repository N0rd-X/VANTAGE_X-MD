const config = require('../../config');
const fs = require('fs');
const path = require('path');
const DB_PATH = path.join(__dirname, '../../database/badwords.json');
const load = () => { try { return JSON.parse(fs.readFileSync(DB_PATH, 'utf8')); } catch { return {}; } };
const save = (d) => fs.writeFileSync(DB_PATH, JSON.stringify(d, null, 2));

module.exports = {
    name: 'badword',
    aliases: ['filter', 'profanity',],
    category: 'group',
    description: 'Manage profanity filter',
    usage: `${config.prefix}badword <on|off|add|remove|list> [word]`,
    async execute(sock, msg, args) {
        try {
            const jid = msg.key.remoteJid;
            if (!jid.endsWith('@g.us')) return await sock.sendMessage(jid, { text: global.mess.group });
            const groupMeta = await sock.groupMetadata(jid);
            const sender = msg.key.participant || msg.key.remoteJid;
            if (!groupMeta.participants.find(p => p.id === sender)?.admin) return await sock.sendMessage(jid, { text: global.mess.admin });
            const db = load();
            if (!db[jid]) db[jid] = { enabled: false, words: ['fuck', 'shit', 'bitch', 'asshole'] };
            const action = args[0]?.toLowerCase();
            if (action === 'on') { db[jid].enabled = true; save(db); return await sock.sendMessage(jid, { text: '🚫 Profanity filter enabled.' }); }
            if (action === 'off') { db[jid].enabled = false; save(db); return await sock.sendMessage(jid, { text: '🚫 Profanity filter disabled.' }); }
            if (action === 'add' && args[1]) { db[jid].words.push(args[1].toLowerCase()); save(db); return await sock.sendMessage(jid, { text: `✅ Added "${args[1]}" to filter.` }); }
            if (action === 'remove' && args[1]) { db[jid].words = db[jid].words.filter(w => w !== args[1].toLowerCase()); save(db); return await sock.sendMessage(jid, { text: `✅ Removed "${args[1]}" from filter.` }); }
            if (action === 'list') return await sock.sendMessage(jid, { text: `📋 Filtered words:\n${db[jid].words.join(', ')}` });
            const status = db[jid].enabled ? 'ON 🟢' : 'OFF 🔴';
            await sock.sendMessage(jid, { text: `🚫 *Profanity Filter*: ${status}\nWords: ${db[jid].words.length}\n\n${this.usage}` });
        } catch (e) { console.error(e.message); await sock.sendMessage(msg.key.remoteJid, { text: global.mess.error }); }
    }
};

module.exports.check = (jid, text) => {
    const db = load();
    if (!db[jid] || !db[jid].enabled) return false;
    return db[jid].words.some(w => text.toLowerCase().includes(w));
};