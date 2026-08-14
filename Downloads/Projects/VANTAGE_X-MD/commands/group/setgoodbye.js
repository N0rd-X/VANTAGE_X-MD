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
    name: 'setgoodbye',
    aliases: ['setbye'],
    category: 'group',
    description: 'Set custom goodbye message',
    usage: `${config.prefix}setgoodbye <text>`,
    
    async execute(sock, msg, args) {
        try {
            const jid = msg.key.remoteJid;
            if (!jid.endsWith('@g.us')) return await sock.sendMessage(jid, { text: global.mess.group });
            
            const groupMeta = await sock.groupMetadata(jid);
            const sender = msg.key.participant || msg.key.remoteJid;
            const senderIsAdmin = groupMeta.participants.find(p => p.id === sender)?.admin;
            
            if (!senderIsAdmin) return await sock.sendMessage(jid, { text: global.mess.admin });
            
            if (!args[0]) {
                return await sock.sendMessage(jid, {
                    text: `❌ Usage: ${this.usage}\n\nUse @user for username.`
                });
            }
            
            const db = loadDB();
            if (!db[jid]) db[jid] = {};
            db[jid].goodbyeText = args.join(' ');
            db[jid].goodbye = true;
            saveDB(db);
            
            await sock.sendMessage(jid, { text: '✅ Goodbye message updated.' });
        } catch (error) {
            console.error('Setgoodbye error:', error.message);
            await sock.sendMessage(msg.key.remoteJid, { text: global.mess.error });
        }
    }
};