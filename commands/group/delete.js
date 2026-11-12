'use strict';

const config           = require('../../config');
const { requireGroup } = require('../../helpers');

module.exports = {
    name: 'delete',
    aliases: ['del', 'd'],
    category: 'group',
    description: 'Delete a quoted message',
    usage: `${config.prefix}delete (reply to message)`,
    
    async execute(sock, msg, args) {
        try {
            const jid = msg.key.remoteJid;
            const ctx = await requireGroup(sock, msg, { admin: true, botAdmin: true });
            if (!ctx) return;

            const quoted = msg.message?.extendedTextMessage?.contextInfo;
            
            if (!quoted) {
                return await sock.sendMessage(jid, { text: '❌ Reply to the message you want to delete.' });
            }
            
            await sock.sendMessage(jid, {
                delete: {
                    remoteJid: jid,
                    fromMe: false,
                    id: quoted.stanzaId,
                    participant: quoted.participant
                }
            });
        } catch (error) {
            console.error('Delete error:', error.message);
            await sock.sendMessage(msg.key.remoteJid, { text: global.mess.error });
        }
    }
};