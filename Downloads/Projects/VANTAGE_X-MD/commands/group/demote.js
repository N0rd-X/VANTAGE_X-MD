const config = require('../../config');
const { isAdmin } = require('../../lib/isAdmin');

module.exports = {
    name: 'demote',
    aliases: ['removeadmin'],
    category: 'group',
    description: 'Remove admin privileges from a group member',
    usage: `${config.prefix}demote @user`,

    async execute(sock, msg, args) {
        try {
            const jid = msg.key.remoteJid;

            if (!jid.endsWith('@g.us')) {
                return await sock.sendMessage(jid, { text: global.mess.group });
            }

            const groupMeta = await sock.groupMetadata(jid);
            const sender = msg.key.participant || msg.key.remoteJid;
            const botId = sock.user.id.replace(/:\d+/, '') + '@s.whatsapp.net';

            const senderIsAdmin = groupMeta.participants.find(p => p.id === sender)?.admin;
            const botIsAdmin = groupMeta.participants.find(p => p.id === botId)?.admin;

            if (!senderIsAdmin) {
                return await sock.sendMessage(jid, { text: global.mess.admin });
            }

            if (!botIsAdmin) {
                return await sock.sendMessage(jid, { text: global.mess.botAdmin });
            }

            const mentioned = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid;
            const target = mentioned?.[0] || (args[0]?.replace(/[^0-9]/g, '') + '@s.whatsapp.net');

            if (!target || target === botId) {
                return await sock.sendMessage(jid, {
                    text: `❌ Usage: ${this.usage}\nMention the member you want to demote.`
                });
            }

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