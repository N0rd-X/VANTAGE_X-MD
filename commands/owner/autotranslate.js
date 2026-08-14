const config = require('../../config');
const fs = require('fs');
const path = require('path');
const axios = require('axios');
const DB_PATH = path.join(__dirname, '../../database/autotranslate.json');
const load = () => { try { return JSON.parse(fs.readFileSync(DB_PATH, 'utf8')); } catch { return {}; } };
const save = (d) => fs.writeFileSync(DB_PATH, JSON.stringify(d, null, 2));

module.exports = {
    name: 'autotranslate',
    aliases: ['autotrans', 'autotr'],
    category: 'owner',
    description: 'Auto-translate non-English messages in group',
    usage: `${config.prefix}autotranslate <on|off> [lang]`,
    ownerOnly: true,
    async execute(sock, msg, args) {
        try {
            const jid = msg.key.remoteJid;
            const sender = msg.key.participant || msg.key.remoteJid;
            const ownerJid = `${config.ownernumber}@s.whatsapp.net`;
            if (sender !== ownerJid) return await sock.sendMessage(jid, { text: '⛔ Owner only.' });
            const action = args[0]?.toLowerCase();
            const db = load();
            if (!db[jid]) db[jid] = { enabled: false, to: 'en' };
            if (action === 'on') {
                db[jid].enabled = true;
                if (args[1]) db[jid].to = args[1];
                save(db);
                return await sock.sendMessage(jid, { text: `🌐 Auto-translate enabled → ${db[jid].to}` });
            } else if (action === 'off') {
                db[jid].enabled = false;
                save(db);
                return await sock.sendMessage(jid, { text: '🌐 Auto-translate disabled.' });
            }
            const status = db[jid].enabled ? 'ON 🟢' : 'OFF 🔴';
            await sock.sendMessage(jid, { text: `🌐 *Auto-Translate*: ${status} → ${db[jid].to}\n\n${this.usage}` });
        } catch (e) { console.error(e.message); await sock.sendMessage(msg.key.remoteJid, { text: global.mess.error }); }
    }
};

module.exports.translate = async (sock, msg, text) => {
    const jid = msg.key.remoteJid;
    const db = load();
    if (!db[jid]?.enabled) return false;
    try {
        const res = await axios.get(`https://api.mymemory.translated.net/get`, { params: { q: text, langpair: `auto|${db[jid].to}` } });
        const translated = res.data?.responseData?.translatedText;
        if (translated && translated !== text) {
            await sock.sendMessage(jid, { text: `🌐 *Translated:* ${translated}` }, { quoted: msg });
            return true;
        }
    } catch (e) { return false; }
    return false;
};