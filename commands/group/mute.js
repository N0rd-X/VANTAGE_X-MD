'use strict';

const config           = require('../../config');
const { requireGroup } = require('../../helpers');

module.exports = {
    name: 'mute',
    aliases: ['close', 'lock'],
    category: 'group',
    description: 'Mute the group (admins only)',
    usage: `${config.prefix}mute`,
    
    async execute(sock, msg, args) {
        try {
            const jid = msg.key.remoteJid;
            const ctx = await requireGroup(sock, msg, { admin: true, botAdmin: true });
            if (!ctx) return;
            
            await sock.groupSettingUpdate(jid, 'announcement');
            await sock.sendMessage(jid, { text: '🔇 Group muted. Only admins can send messages.' });
        } catch (error) {
            console.error('Mute error:', error.message);
            await sock.sendMessage(msg.key.remoteJid, { text: global.mess.error });
        }
    }
};