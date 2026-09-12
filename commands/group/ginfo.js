'use strict';

const config        = require('../../config');
const { send }      = require('../../helpers');
const { card, sc }  = require('../../lib/messageStyle');

module.exports = {
    name: 'ginfo',
    aliases: ['groupinfo', 'gstat'],
    category: 'group',
    description: 'Show group info and statistics',
    usage: `${config.prefix}ginfo`,

    async execute(sock, msg, args) {
        const jid = msg.key.remoteJid;
        try {
            if (!jid.endsWith('@g.us')) return send(sock, jid, global.mess.group);

            const meta    = await sock.groupMetadata(jid);
            const total   = meta.participants.length;
            const admins  = meta.participants.filter(p => p.admin);
            const regular = total - admins.length;
            const created = meta.creation
                ? new Date(meta.creation * 1000).toLocaleDateString('en-ZA', { day:'2-digit', month:'short', year:'numeric' })
                : 'Unknown';

            const adminMentions = admins.map(p => p.id);
            const adminList     = admins.map(p => `@${p.id.split('@')[0]}`).join(', ') || 'None';

            const infoLines = [
                `📛 *${sc('name')}:*    ${meta.subject}`,
                `📅 *${sc('created')}:* ${created}`,
                `🔗 *${sc('gid')}:*     ...${jid.split('@')[0].slice(-6)}`,
                ...(meta.ephemeralDuration
                    ? [`⏳ *${sc('ephemeral')}:* ${meta.ephemeralDuration / 86400}d`]
                    : []),
                ...(meta.desc
                    ? [`📝 *${sc('desc')}:* ${meta.desc.slice(0, 120)}${meta.desc.length > 120 ? '…' : ''}`]
                    : []),
            ];

            const statsLines = [
                `👥 *${sc('members')}:* ${total}`,
                `👑 *${sc('admins')}:*  ${admins.length}`,
                `👤 *${sc('regular')}:* ${regular}`,
            ];

            const adminLines = adminList.split(', ').map(a => `▸ ${a}`);

            const text = card(
                `🏠【 ${sc('group info')} 】`,
                infoLines,
                statsLines,
                [`👑 *${sc('admin list')}:*`, ...adminLines],
            );

            await sock.sendMessage(jid, { text, mentions: adminMentions }, { quoted: msg });

        } catch (err) {
            console.error('[ginfo]', err.message);
            await send(sock, jid, global.mess.error);
        }
    }
};
