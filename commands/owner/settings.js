'use strict';

const config     = require('../../config');
const { readDb } = require('../../lib/db');
const { send, ownerGuard } = require('../../helpers');

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
            // ── ownerGuard: correct 2-arg async call ──────────────────────────
            if (await ownerGuard(sock, msg)) return;

            // ── Read live values from settings.json, fall back to globals ─────
            const db = readDb('settings.json', {});

            const prefix    = db.prefix      || global.prefix          || config.prefix   || '!';
            const mode      = db.mode        || process.env.BOT_MODE   || 'public';
            const ownerName = db.ownername   || global.ownername       || config.ownername || 'Nord-X';
            const ownerNum  = db.ownernumber || global.ownernumber     || config.ownernumber || '';

            // ── Feature flags — read from db first, then global, then false ───
            const flag = (dbKey, globalKey) => {
                const val = db[dbKey] ?? global[globalKey] ?? false;
                return val ? 'ᴏɴ' : 'ᴏꜰꜰ';
            };

            const autoReply      = flag('autoReply',      'autoReply');
            const autoRead       = flag('autoRead',       'autoread');
            const autoRecording  = flag('autoRecording',  'autoRecording');
            const autoLikeStatus = flag('autoLikeStatus', 'autolikestatus');
            const alwaysOnline   = flag('alwaysOnline',   'alwaysonline');
            const afk            = flag('afk',            'afk');

            const maskedNum = ownerNum
                ? '•'.repeat(Math.max(0, ownerNum.length - 4)) + ownerNum.slice(-4)
                : 'ɴᴏᴛ ꜱᴇᴛ';

            const text =
                `┏╾━━━━━━━━━━━━━━━━╼\n` +
                `┃ ⚙️【 ᴠᴀɴᴛᴀɢᴇ-x ᴄᴏɴꜰɪɢ 】\n` +
                `┣╾━━━━━━━━━━━━━━━━╼\n` +
                `┃\n` +
                `┃ 👤 ᴏᴡɴᴇʀ\n` +
                `┃ ├─ ɴᴀᴍᴇ    › ${_sc(ownerName)}\n` +
                `┃ └─ ɴᴜᴍʙᴇʀ  › ${maskedNum}\n` +
                `┃\n` +
                `┃ ⚙️ ʙᴏᴛ\n` +
                `┃ ├─ ᴘʀᴇꜰɪx   › ${prefix}\n` +
                `┃ ├─ ᴍᴏᴅᴇ    › ${_sc(mode)}\n` +
                `┃ └─ ᴀꜰᴋ    › ${afk}\n` +
                `┃\n` +
                `┃ 📡 ᴀᴜᴛᴏᴍᴀᴛɪᴏɴ\n` +
                `┃ ├─ ᴀᴜᴛᴏʀᴇᴘʟʏ      › ${autoReply}\n` +
                `┃ ├─ ᴀᴜᴛᴏʀᴇᴀᴅ       › ${autoRead}\n` +
                `┃ ├─ ᴀᴜᴛᴏʀᴇᴄᴏʀᴅɪɴɢ  › ${autoRecording}\n` +
                `┃ ├─ ᴀᴜᴛᴏʟɪᴋᴇꜱᴛᴀᴛᴜꜱ › ${autoLikeStatus}\n` +
                `┃ └─ ᴀʟᴡᴀʏꜱᴏɴʟɪɴᴇ  › ${alwaysOnline}\n` +
                `┃\n` +
                `┗╾━━━━━━━━━━━━━━━━╼\n\n` +
                `> ᴜꜱᴇ ${prefix}ꜱᴇᴛɴᴜᴍʙᴇʀ, ${prefix}ꜱᴇᴛᴘʀᴇꜰɪx, ${prefix}ꜱᴇᴛᴠᴀʀ ᴛᴏ ᴄʜᴀɴɢᴇ ᴄᴏɴꜰɪɢ`;

            await sock.sendMessage(jid, { text }, { quoted: msg });

        } catch (err) {
            console.error('[settings]', err.message);
            await send(sock, jid, global.mess.error);
        }
    }
};

const SC = {
    a:'ᴀ',b:'ʙ',c:'ᴄ',d:'ᴅ',e:'ᴇ',f:'ꜰ',g:'ɢ',h:'ʜ',i:'ɪ',j:'ᴊ',
    k:'ᴋ',l:'ʟ',m:'ᴍ',n:'ɴ',o:'ᴏ',p:'ᴘ',q:'ǫ',r:'ʀ',s:'ꜱ',t:'ᴛ',
    u:'ᴜ',v:'ᴠ',w:'ᴡ',x:'x',y:'ʏ',z:'ᴢ'
};
const _sc = str => String(str).toLowerCase().split('').map(c => SC[c] || c).join('');
