'use strict';

const config = require('../../config');
const { requireGroup } = require('../../helpers');

module.exports = {
    name: 'rejectall',
    aliases: ['denyall'],
    category: 'group',
    description: 'Reject all pending join requests',
    usage: `${config.prefix}rejectall`,
    
    async execute(sock, msg, args) {
        try {
            const jid = msg.key.remoteJid;
            const ctx = await requireGroup(sock, msg, { admin: true, botAdmin: true });
            if (!ctx) return;
            
            const requests = await sock.groupRequestParticipantsList(jid);
            if (!requests || !requests.length) {
                return await sock.sendMessage(jid, { text: '❌ No pending requests.' });
            }
            
            const jids = requests.map(r => r.jid);
            await sock.groupRequestParticipantsList(jid, jids, 'reject');
            
            await sock.sendMessage(jid, { text: `❌ Rejected ${jids.length} join requests.` });
        } catch (error) {
            console.error('RejectAll error:', error.message);
            await sock.sendMessage(msg.key.remoteJid, { text: global.mess.error });
        }
    }
};