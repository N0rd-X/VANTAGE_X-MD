'use strict';

const config           = require('../../config');
const { requireGroup } = require('../../helpers');
const fs               = require('fs');
const path             = require('path');

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
            const ctx = await requireGroup(sock, msg, { admin: true, botAdmin: true });
            if (!ctx) return;
            
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