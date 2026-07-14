const config = require('../../config');
const axios = require('axios');

module.exports = {
    name: 'github',
    aliases: ['gh', 'repo'],
    category: 'search',
    description: 'Lookup GitHub user or repo',
    usage: `${config.prefix}github <user/repo>`,
    async execute(sock, msg, args) {
        try {
            const jid = msg.key.remoteJid;
            if (!args[0]) return await sock.sendMessage(jid, { text: `❌ Usage: ${this.usage}` });
            const q = args.join(' ');
            const wait = await sock.sendMessage(jid, { text: '🔍 Searching GitHub...' });
            let url, text;
            if (q.includes('/')) {
                const [user, repo] = q.split('/');
                const res = await axios.get(`https://api.github.com/repos/${user}/${repo}`);
                const r = res.data;
                text = `📁 *${r.full_name}*\n\n⭐ Stars: ${r.stargazers_count}\n🍴 Forks: ${r.forks_count}\n📝 Language: ${r.language}\n👁️ Watchers: ${r.watchers_count}\n\n_${r.description || 'No description'}_\n\n🔗 ${r.html_url}`;
            } else {
                const res = await axios.get(`https://api.github.com/users/${q}`);
                const u = res.data;
                text = `👤 *${u.login}*\n\n📛 Name: ${u.name || 'N/A'}\n📝 Bio: ${u.bio || 'N/A'}\n📍 Location: ${u.location || 'N/A'}\n🏢 Public repos: ${u.public_repos}\n👥 Followers: ${u.followers}\n\n🔗 ${u.html_url}`;
            }
            await sock.sendMessage(jid, { text, edit: wait.key });
        } catch (e) { console.error(e.message); await sock.sendMessage(msg.key.remoteJid, { text: '❌ User/repo not found.' }); }
    }
};