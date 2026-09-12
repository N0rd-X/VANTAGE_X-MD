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
    name: 'warn',
    aliases: ['warning'],
    category: 'group',
    description: 'Warn a user. 3 warnings = auto kick.',
    usage: `${config.prefix}warn @user [reason]`,
    
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
            
            if (!target || target === botId) {
                return await sock.sendMessage(jid, { text: `❌ Usage: ${this.usage}` });
            }
            
            const db = loadDB();
            if (!db[jid]) db[jid] = {};
            if (!db[jid][target]) db[jid][target] = [];
            
            const reason = args.slice(1).join(' ') || 'No reason given';
            db[jid][target].push({ reason, warnedBy: sender, time: Date.now() });
            saveDB(db);
            
            const count = db[jid][target].length;
            let text = `⚠️ @${target.split('@')[0]} has been warned.\nReason: ${reason}\nWarnings: ${count}/3`;
            
            if (count >= 3) {
                await sock.groupParticipantsUpdate(jid, [target], 'remove');
                text += `\n\n🚫 Auto-kicked for reaching 3 warnings.`;
                delete db[jid][target];
                saveDB(db);
            }
            
            await sock.sendMessage(jid, { text, mentions: [target] });
        } catch (error) {
            console.error('Warn error:', error.message);
            await sock.sendMessage(msg.key.remoteJid, { text: global.mess.error });
        }
    }
};