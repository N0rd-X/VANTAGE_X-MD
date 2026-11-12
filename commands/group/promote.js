'use strict';

const config = require('../../config');
const { requireGroup, pickTarget, DENY_TARGET } = require('../../helpers');

module.exports = {
    name: 'promote',
    aliases: ['makeadmin'],
    category: 'group',
    description: 'Promote a member to admin',
    usage: `${config.prefix}promote @user`,
    
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

            if (ctx.isBot(target)) return await sock.sendMessage(jid, { text: DENY_TARGET.bot });
            
            await sock.groupParticipantsUpdate(jid, [target], 'promote');
            await sock.sendMessage(jid, {
                text: `✅ @${target.split('@')[0]} has been promoted to admin.`,
                mentions: [target]
            });
        } catch (error) {
            console.error('Promote error:', error.message);
            await sock.sendMessage(msg.key.remoteJid, { text: global.mess.error });
        }
    }
};