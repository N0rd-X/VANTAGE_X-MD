'use strict';

const config                   = require('../../config');
const { readDb }               = require('../../lib/db');
const { send, ownerGuard }     = require('../../helpers');
const { sc, TOP, MID, BOT, R } = require('../../lib/messageStyle');

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
            if (await ownerGuard(sock, msg)) return;

            // ── Read live values from settings.json, fall back to globals ─────
            const db = readDb('settings.json', {});

            const prefix    = db.prefix      || global.prefix        || config.prefix      || '!';
            const mode      = db.mode        || process.env.BOT_MODE || 'public';
            const ownerName = db.ownername   || global.ownername     || config.ownername   || 'Nord-X';
            const ownerNum  = db.ownernumber || global.ownernumber   || config.ownernumber || '';

            // ── Feature flags — read from db first, then global, then false ───
            const flag = (dbKey, globalKey) => {
                const val = db[dbKey] ?? global[globalKey] ?? false;
                return val ? sc('on') : sc('off');
            };

            const autoReply      = flag('autoReply',     'autoReply');
            const autoRead       = flag('autoRead',      'autoread');
            const autoRecording  = flag('autoRecording', 'autoRecording');
            const autoLikeStatus = flag('autoLikeStatus','autolikestatus');
            const alwaysOnline   = flag('alwaysOnline',  'alwaysonline');
            const afk            = flag('afk',           'afk');

            const maskedNum = ownerNum
                ? '•'.repeat(Math.max(0, ownerNum.length - 4)) + ownerNum.slice(-4)
                : sc('not set');

            const text = [
                TOP,
                `${R} ⚙️【 ${sc('vantage-x config')} 】`,
                MID,
                R,
                `${R} 👤 ${sc('owner')}`,
                `${R} ├─ ${sc('name')}    › ${sc(ownerName)}`,
                `${R} └─ ${sc('number')}  › ${maskedNum}`,
                R,
                `${R} ⚙️ ${sc('bot')}`,
                `${R} ├─ ${sc('prefix')}  › ${prefix}`,
                `${R} ├─ ${sc('mode')}    › ${sc(mode)}`,
                `${R} └─ ${sc('afk')}     › ${afk}`,
                R,
                `${R} 📡 ${sc('automation')}`,
                `${R} ├─ ${sc('autoreply')}      › ${autoReply}`,
                `${R} ├─ ${sc('autoread')}       › ${autoRead}`,
                `${R} ├─ ${sc('autorecording')}  › ${autoRecording}`,
                `${R} ├─ ${sc('autolikestatus')} › ${autoLikeStatus}`,
                `${R} └─ ${sc('alwaysonline')}   › ${alwaysOnline}`,
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
