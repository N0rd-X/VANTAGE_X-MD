'use strict';

const config        = require('../../config');
const { send, getGroupContext, makeDB } = require('../../helpers');
const { card, sc }  = require('../../lib/messageStyle');

const db = makeDB('groupsettings.json', {});

module.exports = {
    name: 'goodbye',
    aliases: ['byemsg', 'bye'],
    category: 'group',
    description: 'Toggle goodbye messages or view settings',
    usage: `${config.prefix}goodbye on|off`,

    async execute(sock, msg, args) {
        const jid = msg.key.remoteJid;
        try {
            if (!jid.endsWith('@g.us')) return send(sock, jid, global.mess.group);

            const ctx = await getGroupContext(sock, msg);
            if (!ctx.senderIsAdmin) return send(sock, jid, global.mess.admin);

            const settings = db.load();
            if (!settings[jid]) settings[jid] = {};
            const action   = args[0]?.toLowerCase();

            if (action === 'on' || action === 'off') {
                settings[jid].goodbye = action === 'on';
                db.save(settings);

                const text = card(`🚪【 ${sc('goodbye')} 】`, [
                    `⚙️ *${sc('status')}:* ${action === 'on' ? sc('on') + ' 🟢' : sc('off') + ' 🔴'}`,
                ]);
                return await sock.sendMessage(jid, { text }, { quoted: msg });
            }

            const status = settings[jid].goodbye ? sc('on') + ' 🟢' : sc('off') + ' 🔴';
            const gMsg   = settings[jid].goodbyeText || 'Goodbye @user! 👋';

            const text = card(`🚪【 ${sc('goodbye settings')} 】`, [
                `⚙️ *${sc('status')}:*  ${status}`,
                `💬 *${sc('message')}:* ${gMsg}`,
                '',
                `▸ ${config.prefix}goodbye on|off`,
                `▸ ${config.prefix}setgoodbye <text>`,
            ]);

            await sock.sendMessage(jid, { text }, { quoted: msg });

        } catch (err) {
            console.error('[goodbye]', err.message);
            await send(sock, jid, global.mess.error);
        }
    }
};
