'use strict';

const config    = require('../../config');
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
            if (!ownerGuard(msg)) return send(sock, jid, global.mess.owner);

            // ── Read live values ──────────────────────────────────────────────
            const db = readDb('settings.json', {});

            const prefix  = db.prefix     || config.prefix      || '!';
            const mode    = db.mode       || config.mode         || 'public';
            const ownerName = config.ownername                   || 'Nord-X';
            const ownerNum  = config.ownernumber                 || 'configured';

            // Feature flags — read from db, fall back to config
            const flag = (key, cfgKey) => {
                const val = db[key] ?? config[cfgKey] ?? false;
                return val ? 'ᴏɴ' : 'ᴏꜰꜰ';
            };

            const autoReply       = flag('autoReply',       'autoReply');
            const autoRead        = flag('autoRead',        'autoRead');
            const autoRecording   = flag('autoRecording',   'autoRecording');
            const autoLikeStatus  = flag('autoLikeStatus',  'autoLikeStatus');
            const alwaysOnline    = flag('alwaysOnline',    'alwaysOnline');
            const afk             = flag('afk',             'afk');

            const text =
                `┏╾━━━━━━━━━━━━━━━━╼\n` +
                `┃ ⚙️【 ᴠᴀɴᴛᴀɢᴇ-x ᴄᴏɴꜰɪɢ 】\n` +
                `┣╾━━━━━━━━━━━━━━━━╼\n` +
                `┃\n` +
                `┃ 👤 ᴏᴡɴᴇʀ\n` +
                `┃ ├─ ɴᴀᴍᴇ    › ${_sc(ownerName)}\n` +
                `┃ └─ ɴᴜᴍʙᴇʀ  › ${ownerNum !== 'configured' ? '•'.repeat(6) + ownerNum.slice(-4) : 'ᴄᴏɴꜰɪɢᴜʀᴇᴅ'}\n` +
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
                `┃ ├─ ᴀᴜᴛᴏʟɪᴋᴇsᴛᴀᴛᴜs › ${autoLikeStatus}\n` +
                `┃ └─ ᴀʟᴡᴀʏsᴏɴʟɪɴᴇ  › ${alwaysOnline}\n` +
                `┃\n` +
                `┗╾━━━━━━━━━━━━━━━━╼\n\n` +
                `> ᴜsᴇ ${prefix}sᴇᴛᴘʀᴇꜰɪx, ${prefix}sᴇᴛᴠᴀʀ ᴇᴛᴄ. ᴛᴏ ᴄʜᴀɴɢᴇ ᴄᴏɴꜰɪɢ`;

            await sock.sendMessage(jid, { text }, { quoted: msg });

        } catch (err) {
            console.error('[settings]', err.message);
            await send(sock, jid, global.mess.error);
        }
    }
};

// ── Inline small-caps converter ───────────────────────────────────────────────

const SC = {
    a:'ᴀ',b:'ʙ',c:'ᴄ',d:'ᴅ',e:'ᴇ',f:'ꜰ',g:'ɢ',h:'ʜ',i:'ɪ',j:'ᴊ',
    k:'ᴋ',l:'ʟ',m:'ᴍ',n:'ɴ',o:'ᴏ',p:'ᴘ',q:'ǫ',r:'ʀ',s:'s',t:'ᴛ',
    u:'ᴜ',v:'ᴠ',w:'ᴡ',x:'x',y:'ʏ',z:'ᴢ'
};

const _sc = str => String(str).toLowerCase().split('').map(c => SC[c] || c).join('');
