const config = require('../../config');
const fs = require('fs');
const path = require('path');

const DB_PATH = path.join(__dirname, '../../database/antispam.json');

function loadDB() {
    try { return JSON.parse(fs.readFileSync(DB_PATH, 'utf8')); } catch { return {}; }
}
function saveDB(data) {
    fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
}

module.exports = {
    name: 'antispam',
    aliases: ['nospam'],
    category: 'group',
    description: 'Toggle anti-spam protection',
    usage: `${config.prefix}antispam <on|off>`,
    
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
                return await sock.sendMessage(jid, { text: '🛡️ Anti-Spam enabled. Repeated messages will be deleted.' });
            } else if (action === 'off') {
                db[jid] = false;
                saveDB(db);
                return await sock.sendMessage(jid, { text: '🛡️ Anti-Spam disabled.' });
            }
            
            const status = db[jid] ? 'ON 🟢' : 'OFF 🔴';
            await sock.sendMessage(jid, { text: `🛡️ *Anti-Spam*: ${status}\n\n${this.usage}` });
        } catch (error) {
            console.error('AntiSpam error:', error.message);
            await sock.sendMessage(msg.key.remoteJid, { text: global.mess.error });
        }
    }
};