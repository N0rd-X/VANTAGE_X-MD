const config = require('../../config');
const fs = require('fs');
const path = require('path');

const DB_PATH = path.join(__dirname, '../../database/warns.json');

function loadDB() {
    try { return JSON.parse(fs.readFileSync(DB_PATH, 'utf8')); } catch { return {}; }
}
function saveDB(data) {
    fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
}

module.exports = {
    name: 'resetwarn',
    aliases: ['unwarn', 'clearwarn'],
    category: 'group',
    description: 'Reset warnings for a user',
    usage: `${config.prefix}resetwarn @user`,
    
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
            
            const mentioned = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid;
            const target = mentioned?.[0] || (args[0]?.replace(/[^0-9]/g, '') + '@s.whatsapp.net');
            
            if (!target) {
                return await sock.sendMessage(jid, { text: `❌ Usage: ${this.usage}` });
            }
            
            const db = loadDB();
            if (db[jid]?.[target]) {
                delete db[jid][target];
                saveDB(db);
            }
            
            await sock.sendMessage(jid, {
                text: `✅ Warnings for @${target.split('@')[0]} have been reset.`,
                mentions: [target]
            });
        } catch (error) {
            console.error('Resetwarn error:', error.message);
            await sock.sendMessage(msg.key.remoteJid, { text: global.mess.error });
        }
    }
};