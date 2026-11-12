'use strict';

const config = require('../../config');
const { requireGroup, pickTarget, DENY_TARGET } = require('../../helpers');

module.exports = {
    name: 'kick',
    aliases: ['remove', 'ban'],
    category: 'group',
    description: 'Kick a member from the group',
    usage: `${config.prefix}kick @user`,
    
    async execute(sock, msg, args) {
        try {
            const jid = msg.key.remoteJid;
            const ctx = await requireGroup(sock, msg, { admin: true, botAdmin: true });
            if (!ctx) return;
            
            
            const rawTarget = pickTarget(msg, args);
            const entry     = rawTarget && ctx.participantFor(rawTarget);
            if (!entry) {
                return await sock.sendMessage(jid, {
                    text: rawTarget ? '❌ That user is not in this group.' : `❌ Usage: ${this.usage}`
                });
            }
            const target = entry.id;

            const guard = ctx.canTarget(target);
            if (!guard.ok) return await sock.sendMessage(jid, { text: DENY_TARGET[guard.reason] });
            
            await sock.groupParticipantsUpdate(jid, [target], 'remove');
            await sock.sendMessage(jid, {
                text: `🚫 @${target.split('@')[0]} has been kicked.`,
                mentions: [target]
            });
        } catch (error) {
            console.error('Kick error:', error.message);
            await sock.sendMessage(msg.key.remoteJid, { text: global.mess.error });
        }
    }
};