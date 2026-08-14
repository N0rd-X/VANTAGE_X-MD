const config = require('../../config');
const fs = require('fs');
const path = require('path');
const DB_PATH = path.join(__dirname, '../../database/autosticker.json');
const load = () => { try { return JSON.parse(fs.readFileSync(DB_PATH, 'utf8')); } catch { return {}; } };
const save = (d) => fs.writeFileSync(DB_PATH, JSON.stringify(d, null, 2));

module.exports = {
    name: 'autosticker',
    aliases: ['autostick', 'autos'],
    category: 'group',
    description: 'Auto-convert images to stickers',
    weight: 'heavy'
    usage: `${config.prefix}autosticker <on|off>`,
    async execute(sock, msg, args) {
        try {
            const jid = msg.key.remoteJid;
            if (!jid.endsWith('@g.us')) return await sock.sendMessage(jid, { text: global.mess.group });
            const groupMeta = await sock.groupMetadata(jid);
            const sender = msg.key.participant || msg.key.remoteJid;
            if (!groupMeta.participants.find(p => p.id === sender)?.admin) return await sock.sendMessage(jid, { text: global.mess.admin });
            const action = args[0]?.toLowerCase();
            const db = load();
            if (action === 'on') { db[jid] = true; save(db); return await sock.sendMessage(jid, { text: '🎨 Auto-sticker enabled.' }); }
            else if (action === 'off') { db[jid] = false; save(db); return await sock.sendMessage(jid, { text: '🎨 Auto-sticker disabled.' }); }
            const status = db[jid] ? 'ON 🟢' : 'OFF 🔴';
            await sock.sendMessage(jid, { text: `🎨 *Auto-Sticker*: ${status}\n\n${this.usage}` });
        } catch (e) { console.error(e.message); await sock.sendMessage(msg.key.remoteJid, { text: global.mess.error }); }
    }
};

module.exports.isEnabled = (jid) => { const db = load(); return !!db[jid]; };