'use strict';

const config = require('../../config');
const { requireGroup, pickTarget, DENY_TARGET } = require('../../helpers');
const fs     = require('fs');
const path   = require('path');

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
            const ctx = await requireGroup(sock, msg, { admin: true, botAdmin: true });
            if (!ctx) return;
            const { sender } = ctx;
            
            const rawTarget = pickTarget(msg, args);
            const entry     = rawTarget && ctx.participantFor(rawTarget);
            if (!entry) {
                return await sock.sendMessage(jid, {
                    text: rawTarget ? '❌ That user is not in this group.' : `❌ Usage: ${this.usage}`
                });
            }
            const target = entry.id;

            const guard = ctx.canTarget(target);
            if (!guard.ok) return await sock.sendMessage(jid, { text: DENY_TARGET[guard.reason] });
            
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