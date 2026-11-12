'use strict';

const config = require('../../config');
const { requireGroup, pickTarget, DENY_TARGET } = require('../../helpers');

module.exports = {
    name: 'demote',
    aliases: ['removeadmin'],
    category: 'group',
    description: 'Remove admin privileges from a group member',
    usage: `${config.prefix}demote @user`,

    async execute(sock, msg, args) {
        try {
            const jid = msg.key.remoteJid;

            const ctx = await requireGroup(sock, msg, { admin: true, botAdmin: true });
            if (!ctx) return;
            const { meta: groupMeta } = ctx;

            const rawTarget = pickTarget(msg, args);
            const entry     = rawTarget && ctx.participantFor(rawTarget);
            if (!entry) {
                return await sock.sendMessage(jid, {
                    text: rawTarget ? '❌ That user is not in this group.' : `❌ Usage: ${this.usage}\nMention the member you want to demote.`
                });
            }
            const target = entry.id;

            const guard = ctx.canTarget(target);
            if (!guard.ok) return await sock.sendMessage(jid, { text: DENY_TARGET[guard.reason] });

            const targetParticipant = groupMeta.participants.find(p => p.id === target);
            if (!targetParticipant) {
                return await sock.sendMessage(jid, { text: '❌ User not found in this group.' });
            }

            if (!targetParticipant.admin) {
                return await sock.sendMessage(jid, { text: '❌ That user is not an admin.' });
            }

            await sock.groupParticipantsUpdate(jid, [target], 'demote');

            await sock.sendMessage(jid, {
                text: `✅ @${target.split('@')[0]} has been demoted from admin.`,
                mentions: [target]
            });

        } catch (error) {
            console.error('Demote error:', error.message);
            await sock.sendMessage(msg.key.remoteJid, { text: global.mess.error });
        }
    }
};