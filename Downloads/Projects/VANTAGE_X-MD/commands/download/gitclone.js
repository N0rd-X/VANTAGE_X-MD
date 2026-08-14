const config = require('../../config');
const axios = require('axios');

module.exports = {
    name: 'gitclone',
    aliases: ['git', 'github'],
    category: 'download',
    description: 'Download GitHub repository as ZIP',
    usage: `${config.prefix}gitclone <repo url>`,
    
    async execute(sock, msg, args) {
        try {
            const jid = msg.key.remoteJid;
            if (!args[0]) return await sock.sendMessage(jid, { text: `❌ Usage: ${this.usage}` });
            
            const url = args[0];
            const match = url.match(/github\.com\/([^\/]+)\/([^\/]+)/);
            if (!match) return await sock.sendMessage(jid, { text: '❌ Invalid GitHub URL.' });
            
            const [, user, repo] = match;
            const repoName = repo.replace('.git', '');
            const zipUrl = `https://github.com/${user}/${repoName}/archive/refs/heads/main.zip`;
            
            await sock.sendMessage(jid, {
                document: { url: zipUrl },
                mimetype: 'application/zip',
                fileName: `${repoName}.zip`,
                caption: `📁 GitHub Repository\n*${user}/${repoName}*\n> Downloaded by VANTAGE-X MD`
            });
        } catch (error) {
            console.error('GitClone error:', error.message);
            await sock.sendMessage(msg.key.remoteJid, { text: global.mess.error });
        }
    }
};