const config = require('../../config');
const fs = require('fs');
const path = require('path');

const DB_PATH = path.join(__dirname, '../../database/antiviewonce.json');

function loadDB() {
    try { return JSON.parse(fs.readFileSync(DB_PATH, 'utf8')); } catch { return {}; }
}
function saveDB(data) {
    fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
}

module.exports = {
    name: 'antiviewonce',
    aliases: ['antivo', 'novo'],
    category: 'group',
    description: 'Auto-resend view-once messages',
    usage: `${config.prefix}antiviewonce <on|off>`,
    
    async execute(sock, msg, args) {
        try {
            const jid = msg.key.remoteJid;
            if (!jid.endsWith('@g.us')) return await sock.sendMessage(jid, { text: global.mess.group });
            
            const groupMeta = await sock.groupMetadata(jid);
            const sender = msg.key.participant || msg.key.remoteJid;
            const botId = sock.user.id.replace(/:\d+/, '') + '@s.whatsapp.net';
            
            const senderIsAdmin = groupMeta.participants.find(p => p.id === sender)?.admin;
            const botIsAdmin = groupMeta.participants.find(p => p.id === botId)?.admin;
            
            if (!senderIsAdmin) return await sock.sendMessage(jid, { text: global.mess.admin });
            if (!botIsAdmin) return await sock.sendMessage(jid, { text: global.mess.botAdmin });
            
            const action = args[0]?.toLowerCase();
            const db = loadDB();
            
            if (action === 'on') {
                db[jid] = true;
                saveDB(db);
                return await sock.sendMessage(jid, { text: '👁️ Anti-ViewOnce enabled. I will resend view-once media.' });
            } else if (action === 'off') {
                db[jid] = false;
                saveDB(db);
                return await sock.sendMessage(jid, { text: '👁️ Anti-ViewOnce disabled.' });
            }
            
            const status = db[jid] ? 'ON 🟢' : 'OFF 🔴';
            await sock.sendMessage(jid, { text: `👁️ *Anti-ViewOnce*: ${status}\n\n${this.usage}` });
        } catch (error) {
            console.error('AntiViewOnce error:', error.message);
            await sock.sendMessage(msg.key.remoteJid, { text: global.mess.error });
        }
    }
};