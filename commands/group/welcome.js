const config = require('../../config');
const fs = require('fs');
const path = require('path');

const DB_PATH = path.join(__dirname, '../../database/groupsettings.json');

function loadDB() {
    try { return JSON.parse(fs.readFileSync(DB_PATH, 'utf8')); } catch { return {}; }
}
function saveDB(data) {
    fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
}

module.exports = {
    name: 'welcome',
    aliases: ['welcomemsg'],
    category: 'group',
    description: 'Toggle or show welcome message settings',
    usage: `${config.prefix}welcome on|off`,
    
    async execute(sock, msg, args) {
        try {
            const jid = msg.key.remoteJid;
            if (!jid.endsWith('@g.us')) return await sock.sendMessage(jid, { text: global.mess.group });
            
            const groupMeta = await sock.groupMetadata(jid);
            const sender = msg.key.participant || msg.key.remoteJid;
            const senderIsAdmin = groupMeta.participants.find(p => p.id === sender)?.admin;
            
            if (!senderIsAdmin) return await sock.sendMessage(jid, { text: global.mess.admin });
            
            const db = loadDB();
            if (!db[jid]) db[jid] = {};
            
            const action = args[0]?.toLowerCase();
            if (action === 'on') {
                db[jid].welcome = true;
                saveDB(db);
                return await sock.sendMessage(jid, { text: '👋 Welcome messages enabled.' });
            } else if (action === 'off') {
                db[jid].welcome = false;
                saveDB(db);
                return await sock.sendMessage(jid, { text: '👋 Welcome messages disabled.' });
            }
            
            const status = db[jid].welcome ? 'ON 🟢' : 'OFF 🔴';
            const message = db[jid].welcomeText || 'Welcome @user to @group!';
            await sock.sendMessage(jid, {
                text: `👋 *Welcome Settings*\n\nStatus: ${status}\nMessage: ${message}\n\nUse ${config.prefix}setwelcome <text> to change message.`
            });
        } catch (error) {
            console.error('Welcome error:', error.message);
            await sock.sendMessage(msg.key.remoteJid, { text: global.mess.error });
        }
    }
};