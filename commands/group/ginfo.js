'use strict';

const config   = require('../../config');
const { send } = require('../../helpers');

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
            const created = meta.creation
                ? new Date(meta.creation * 1000).toDateString()
                : 'Unknown';

            const adminMentions = admins.map(p => p.id);
            const adminList     = admins.map(p => `@${p.id.split('@')[0]}`).join(', ');

            const text =
                `🏠 *Group Info*\n\n` +
                `*Name:*      ${meta.subject}\n` +
                `*Created:*   ${created}\n` +
                `*Members:*   ${total}\n` +
                `*Admins:*    ${admins.length}\n` +
                `*Ephemeral:* ${meta.ephemeralDuration ? `${meta.ephemeralDuration / 86400}d` : 'Off'}\n` +
                (meta.desc ? `\n*Description:*\n${meta.desc}\n` : '') +
                `\n👑 *Admins:* ${adminList}`;

            await sock.sendMessage(jid, { text, mentions: adminMentions }, { quoted: msg });

        } catch (err) {
            console.error('[ginfo]', err.message);
            await send(sock, jid, global.mess.error);
        }
    }
};
