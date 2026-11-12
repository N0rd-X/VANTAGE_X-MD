'use strict';

const config = require('../../config');
const { requireGroup } = require('../../helpers');

module.exports = {
    name: 'reject',
    aliases: ['deny'],
    category: 'group',
    description: 'Reject a group join request',
    usage: `${config.prefix}reject @user`,
    
    async execute(sock, msg, args) {
        try {
            const jid = msg.key.remoteJid;
            const ctx = await requireGroup(sock, msg, { admin: true, botAdmin: true });
            if (!ctx) return;
            
            const mentioned = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid;
            const target = mentioned?.[0] || (args[0]?.replace(/[^0-9]/g, '') + '@s.whatsapp.net');
            
            if (!target) return await sock.sendMessage(jid, { text: `❌ Usage: ${this.usage}` });
            
            await sock.groupRequestParticipantsList(jid, [target], 'reject');
            
            await sock.sendMessage(jid, {
                text: `❌ Rejected @${target.split('@')[0]}.`,
                mentions: [target]
            });
        } catch (error) {
            console.error('Reject error:', error.message);
            await sock.sendMessage(msg.key.remoteJid, { text: global.mess.error });
        }
    }
};