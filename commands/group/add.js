'use strict';

const config           = require('../../config');
const { requireGroup } = require('../../helpers');

module.exports = {
    name: 'add',
    aliases: [],
    category: 'group',
    description: 'Add a member to the group',
    usage: `${config.prefix}add <number>`,
    
    async execute(sock, msg, args) {
        try {
            const jid = msg.key.remoteJid;
            const ctx = await requireGroup(sock, msg, { admin: true, botAdmin: true });
            if (!ctx) return;
            
            if (!args[0]) {
                return await sock.sendMessage(jid, { text: `❌ Usage: ${this.usage}\n\nExample: ${config.prefix}add 1234567890` });
            }
            
            const number = args[0].replace(/[^0-9]/g, '');
            const target = number + '@s.whatsapp.net';
            
            await sock.groupParticipantsUpdate(jid, [target], 'add');
            await sock.sendMessage(jid, {
                text: `✅ Added @${number} to the group.`,
                mentions: [target]
            });
        } catch (error) {
            console.error('Add error:', error.message);
            await sock.sendMessage(msg.key.remoteJid, { text: '❌ Failed to add user. They may have privacy settings enabled.' });
        }
    }
};
