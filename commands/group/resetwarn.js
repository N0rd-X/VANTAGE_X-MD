'use strict';

const config                       = require('../../config');
const { requireGroup, pickTarget } = require('../../helpers');
const fs                           = require('fs');
const path                         = require('path');

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
            const ctx = await requireGroup(sock, msg, { admin: true, botAdmin: true });
            if (!ctx) return;
            
            const rawTarget = pickTarget(msg, args);
            const entry     = rawTarget && ctx.participantFor(rawTarget);
            if (!entry) {
                return await sock.sendMessage(jid, {
                    text: rawTarget ? '❌ That user is not in this group.' : `❌ Usage: ${this.usage}`
                });
            }
            const target = entry.id;
            
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