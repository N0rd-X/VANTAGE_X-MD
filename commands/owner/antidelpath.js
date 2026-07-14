const config = require('../../config');
const fs = require('fs');
const path = require('path');

const DB_PATH = path.join(__dirname, '../../database/antidelete.json');

function loadDB() {
    try { return JSON.parse(fs.readFileSync(DB_PATH, 'utf8')); } catch { return { enabled: false }; }
}
function saveDB(data) {
    fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
}

module.exports = {
    name: 'antidelpath',
    aliases: ['antideletepath'],
    category: 'owner',
    description: 'Toggle anti-delete (recall deleted messages)',
    usage: `${config.prefix}antidelpath <on|off>`,
    ownerOnly: true,
    
    async execute(sock, msg, args) {
        try {
            const jid = msg.key.remoteJid;
            const sender = msg.key.participant || msg.key.remoteJid;
            const ownerJid = `${config.ownernumber}@s.whatsapp.net`;
            
            if (sender !== ownerJid) return await sock.sendMessage(jid, { text: '⛔ Owner only.' });
            
            const action = args[0]?.toLowerCase();
            const db = loadDB();
            
            if (action === 'on') {
                db.enabled = true;
                saveDB(db);
                return await sock.sendMessage(jid, { text: '🛡️ Anti-delete enabled. Deleted messages will be resent.' });
            } else if (action === 'off') {
                db.enabled = false;
                saveDB(db);
                return await sock.sendMessage(jid, { text: '🛡️ Anti-delete disabled.' });
            }
            
            const status = db.enabled ? 'ON 🟢' : 'OFF 🔴';
            await sock.sendMessage(jid, { text: `🛡️ *Anti-Delete*: ${status}\n\n${this.usage}` });
        } catch (error) {
            console.error('AntiDelPath error:', error.message);
            await sock.sendMessage(msg.key.remoteJid, { text: global.mess.error });
        }
    }
};