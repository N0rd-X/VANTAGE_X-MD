'use strict';

const config         = require('../../config');
const { send, getGroupContext } = require('../../helpers');
const { card, sc }   = require('../../lib/messageStyle');

module.exports = {
    name: 'tagall',
    aliases: ['mentionall', 'all'],
    category: 'group',
    description: 'Tag all group members with a styled list',
    usage: `${config.prefix}tagall <message>`,

    async execute(sock, msg, args) {
        const jid = msg.key.remoteJid;
        try {
            if (!jid.endsWith('@g.us')) return send(sock, jid, global.mess.group);

            const ctx = await getGroupContext(sock, msg);
            if (!ctx.senderIsAdmin) return send(sock, jid, global.mess.admin);

            const participants = ctx.meta.participants.map(p => p.id);
            const message      = args.join(' ').trim() || '📢 Attention everyone!';

            const memberLines = participants.map((id, i) =>
                `${String(i + 1).padStart(2, '0')}. @${id.split('@')[0]}`
            );

            const text = card(
                `📢【 ${sc('tag all')} 】`,
                [`💬 ${message}`],
                [`👥 ${sc(`members (${participants.length})`)}`],
                memberLines
            );

            await sock.sendMessage(jid, { text, mentions: participants }, { quoted: msg });

        } catch (err) {
            console.error('[tagall]', err.message);
            await send(sock, jid, global.mess.error);
        }
    }
};
