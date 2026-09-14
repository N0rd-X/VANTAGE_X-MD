'use strict';

const config        = require('../../config');
const { send, getGroupContext, makeDB } = require('../../helpers');
const { card, sc }  = require('../../lib/messageStyle');

const db = makeDB('groupsettings.json', {});

module.exports = {
    name: 'welcome',
    aliases: ['welcomemsg'],
    category: 'group',
    description: 'Toggle welcome messages or view settings',
    usage: `${config.prefix}welcome on|off`,

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
                settings[jid].welcome = action === 'on';
                db.save(settings);

                const text = card(`👋【 ${sc('welcome')} 】`, [
                    `⚙️ *${sc('status')}:* ${action === 'on' ? sc('on') + ' 🟢' : sc('off') + ' 🔴'}`,
                ]);
                return await sock.sendMessage(jid, { text }, { quoted: msg });
            }

            const status = settings[jid].welcome ? sc('on') + ' 🟢' : sc('off') + ' 🔴';
            const wMsg   = settings[jid].welcomeText || 'Welcome @user to @group! 🎉';

            const text = card(`👋【 ${sc('welcome settings')} 】`, [
                `⚙️ *${sc('status')}:*  ${status}`,
                `💬 *${sc('message')}:* ${wMsg}`,
                '',
                `▸ ${config.prefix}welcome on|off`,
                `▸ ${config.prefix}setwelcome <text>`,
            ]);

            await sock.sendMessage(jid, { text }, { quoted: msg });

        } catch (err) {
            console.error('[welcome]', err.message);
            await send(sock, jid, global.mess.error);
        }
    }
};
