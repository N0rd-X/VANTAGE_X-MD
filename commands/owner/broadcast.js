const config = require('../../config');

module.exports = {
    name: 'broadcast',
    aliases: ['bc', 'announce'],
    category: 'owner',
    description: 'Broadcast message to all groups',
    usage: `${config.prefix}broadcast <message>`,
    ownerOnly: true,

    async execute(sock, msg, args) {
        try {
            const jid    = msg.key.remoteJid;
            const sender = msg.key.participant || msg.key.remoteJid;
            const ownerJid = `${config.ownernumber}@s.whatsapp.net`;

            if (sender !== ownerJid) return await sock.sendMessage(jid, { text: '⛔ Owner only.' });

            if (!args[0]) {
                return await sock.sendMessage(jid, {
                    text: `❌ Usage: ${this.usage}\n\nExample: ${config.prefix}broadcast Important announcement!`
                });
            }

            const message  = args.join(' ');
            const groups   = await sock.groupFetchAllParticipating();
            const groupList = Object.values(groups);

            await sock.sendMessage(jid, { text: `📢 Broadcasting to ${groupList.length} groups...` });

            let success = 0, failed = 0;

            for (const group of groupList) {
                try {
                    await sock.sendMessage(group.id, {
                        text: `📢 *BROADCAST*\n\n${message}\n\n_Sent by ${config.botname || 'VANTAGE-X MD'}_`
                    });
                    success++;
                    await new Promise(resolve => setTimeout(resolve, 2000));
                } catch (groupError) {
                    console.error(`Failed to broadcast to ${group.id}:`, groupError.message);
                    failed++;
                }
            }

            await sock.sendMessage(jid, {
                text: `✅ *Broadcast Complete*\n\nSuccess: ${success}\nFailed: ${failed}\nTotal: ${groupList.length}`
            });

        } catch (error) {
            console.error('Broadcast error:', error.message);
            await sock.sendMessage(msg.key.remoteJid, { text: global.mess.error });
        }
    }
};
