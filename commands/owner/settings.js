'use strict';

const fs                       = require('fs');
const path                     = require('path');
const config                   = require('../../config');
const { send }                 = require('../../helpers');
const { isOwner, getMode }     = require('../../services/commands');
const { sc, TOP, MID, BOT, R } = require('../../lib/messageStyle');

const DB_DIR = path.join(__dirname, '../../database');

// Read a JSON file straight from disk (no cache) so the view is never stale
const readNow = (file, fallback = {}) => {
    try { return JSON.parse(fs.readFileSync(path.join(DB_DIR, file), 'utf8')); }
    catch { return fallback; }
};

const onOff = (v) => (v ? sc('on') : sc('off'));

module.exports = {
    name: 'settings',
    aliases: ['config', 'cfg'],
    category: 'owner',
    description: 'View the current bot configuration',
    usage: `${config.prefix}settings`,
    ownerOnly: true,

    async execute(sock, msg, args) {
        const jid = msg.key.remoteJid;
        try {
            // ── Identity / bot — the live values the bot is running with ──────
            const prefix    = global.prefix                       || '!';
            const ownerName = config.ownername  || global.ownername  || sc('not set');
            const ownerNum  = config.ownernumber || global.ownernumber || '';
            const mode      = getMode();

            const ownerAfk  = Object.keys(readNow('afk.json')).some(k => isOwner(k));

            // ── Automation ─────────────────────────────────────────────────────
            const autoReply = !!readNow('autoreply.json').enabled;

            const text = [
                TOP,
                `${R} ⚙️【 ${sc('vantage-x config')} 】`,
                MID,
                R,
                `${R} 👤 ${sc('owner')}`,
                `${R} ├─ ${sc('name')}    › ${sc(ownerName)}`,
                `${R} └─ ${sc('number')}  › ${ownerNum || sc('not set')}`,
                R,
                `${R} ⚙️ ${sc('bot')}`,
                `${R} ├─ ${sc('prefix')}  › ${prefix}`,
                `${R} ├─ ${sc('mode')}    › ${sc(mode)}`,
                `${R} └─ ${sc('afk')}     › ${onOff(ownerAfk)}`,
                R,
                `${R} 📡 ${sc('automation')}`,
                `${R} ├─ ${sc('autoreply')}      › ${onOff(autoReply)}`,
                `${R} ├─ ${sc('autoread')}       › ${onOff(global.autoread)}`,
                `${R} ├─ ${sc('autotyping')}     › ${onOff(global.autoTyping)}`,
                `${R} ├─ ${sc('autorecording')}  › ${onOff(global.autoRecording)}`,
                `${R} ├─ ${sc('autoreact')}      › ${onOff(global.autoreact)}`,
                `${R} ├─ ${sc('autolikestatus')} › ${onOff(global.autolikestatus)}`,
                `${R} ├─ ${sc('alwaysonline')}   › ${onOff(global.alwaysonline)}`,
                `${R} ├─ ${sc('autoviewstatus')} › ${onOff(global.autoswview)}`,
                `${R} └─ ${sc('autobio')}        › ${onOff(global.autobio)}`,
                R,
                BOT,
                '',
                `> ${sc('use')} ${prefix}${sc('setnumber')}, ${prefix}${sc('setprefix')}, ${prefix}${sc('setvar')} ${sc('to change config')}`,
            ].join('\n');

            await sock.sendMessage(jid, { text }, { quoted: msg });

        } catch (err) {
            console.error('[settings]', err.message);
            await send(sock, jid, global.mess.error);
        }
    }
};
