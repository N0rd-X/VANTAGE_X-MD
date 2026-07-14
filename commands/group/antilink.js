const config = require('../../config');
const fs = require('fs');
const path = require('path');

const DB_PATH = path.join(__dirname, '../../database/antilink.json');

function loadDB() {
    try {
        return JSON.parse(fs.readFileSync(DB_PATH, 'utf8'));
    } catch {
        return {};
    }
}

function saveDB(data) {
    fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
}

module.exports = {
    name: 'antilink',
    aliases: ['nolink'],
    category: 'group',
    description: 'Toggle anti-link protection. Deletes messages containing links.',
    usage: `${config.prefix}antilink <on|off>`,

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

            const action = args[0]?.toLowerCase();

            if (!['on', 'off'].includes(action)) {
                const db = loadDB();
                const current = db[jid] ? 'ON 🟢' : 'OFF 🔴';
                return await sock.sendMessage(jid, {
                    text: `🔗 *Anti-Link Status*: ${current}\n\nUsage: ${this.usage}`
                });
            }

            const db = loadDB();
            db[jid] = action === 'on';
            saveDB(db);

            await sock.sendMessage(jid, {
                text: action === 'on'
                    ? `🔗 *Anti-Link enabled.*\nAny message containing a link will be deleted and the sender warned.`
                    : `🔗 *Anti-Link disabled.*\nLinks are now allowed in this group.`
            });

        } catch (error) {
            console.error('Antilink error:', error.message);
            await sock.sendMessage(msg.key.remoteJid, { text: global.mess.error });
        }
    }
};