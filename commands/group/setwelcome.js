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
    name: 'setwelcome',
    aliases: ['setwlc'],
    category: 'group',
    description: 'Set custom welcome message',
    usage: `${config.prefix}setwelcome <text>`,
    
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
                    text: `❌ Usage: ${this.usage}\n\nUse @user for username, @group for group name.`
                });
            }
            
            const db = loadDB();
            if (!db[jid]) db[jid] = {};
            db[jid].welcomeText = args.join(' ');
            db[jid].welcome = true;
            saveDB(db);
            
            await sock.sendMessage(jid, { text: '✅ Welcome message updated.' });
        } catch (error) {
            console.error('Setwelcome error:', error.message);
            await sock.sendMessage(msg.key.remoteJid, { text: global.mess.error });
        }
    }
};