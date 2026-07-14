const config = require('../../config');
const fs = require('fs');
const path = require('path');

const DB_PATH = path.join(__dirname, '../../database/autoreply.json');

function loadDB() {
    try { return JSON.parse(fs.readFileSync(DB_PATH, 'utf8')); } catch { return { enabled: false, replies: {} }; }
}
function saveDB(data) {
    fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
}

module.exports = {
    name: 'autoreply',
    aliases: ['autorespond'],
    category: 'owner',
    description: 'Toggle or set auto-reply messages',
  weight: 'heavy'
    usage: `${config.prefix}autoreply <on|off|set> [trigger] [response]`,
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
                return await sock.sendMessage(jid, { text: '💬 Auto-reply enabled.' });
            } else if (action === 'off') {
                db.enabled = false;
                saveDB(db);
                return await sock.sendMessage(jid, { text: '💬 Auto-reply disabled.' });
            } else if (action === 'set' && args[2]) {
                const trigger = args[1].toLowerCase();
                const response = args.slice(2).join(' ');
                db.replies[trigger] = response;
                saveDB(db);
                return await sock.sendMessage(jid, { text: `✅ Auto-reply set: "${trigger}" → "${response}"` });
            }
            
            const status = db.enabled ? 'ON 🟢' : 'OFF 🔴';
            const triggers = Object.keys(db.replies).length;
            await sock.sendMessage(jid, {
                text: `💬 *Auto-Reply*\nStatus: ${status}\nTriggers: ${triggers}\n\n${this.usage}`
            });
        } catch (error) {
            console.error('AutoReply error:', error.message);
            await sock.sendMessage(msg.key.remoteJid, { text: global.mess.error });
        }
    }
};