const config = require('../../config');
const axios = require('axios');

module.exports = {
    name: 'npm',
    aliases: ['package', 'node'],
    category: 'search',
    description: 'Lookup NPM package',
    usage: `${config.prefix}npm <package>`,
    async execute(sock, msg, args) {
        try {
            const jid = msg.key.remoteJid;
            if (!args[0]) return await sock.sendMessage(jid, { text: `❌ Usage: ${this.usage}` });
            const q = args[0];
            const wait = await sock.sendMessage(jid, { text: '🔍 Searching NPM...' });
            const res = await axios.get(`https://registry.npmjs.org/${q}`);
            const p = res.data;
            const latest = p['dist-tags']?.latest;
            const v = p.versions?.[latest];
            const text = `📦 *${p.name}*\n\n🏷️ Latest: ${latest}\n📝 ${p.description || 'No description'}\n👤 Author: ${v?.author?.name || 'N/A'}\n📅 Modified: ${p.time?.modified?.split('T')[0]}\n\n🔗 https://npmjs.com/package/${q}`;
            await sock.sendMessage(jid, { text, edit: wait.key });
        } catch (e) { console.error(e.message); await sock.sendMessage(msg.key.remoteJid, { text: '❌ Package not found.' }); }
    }
};