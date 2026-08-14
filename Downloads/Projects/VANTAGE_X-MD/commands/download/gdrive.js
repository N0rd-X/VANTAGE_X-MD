const config = require('../../config');
const axios = require('axios');

module.exports = {
    name: 'gdrive',
    aliases: ['gddl', 'drive'],
    category: 'download',
    description: 'Download from Google Drive',
    weight: 'heavy'
    usage: `${config.prefix}gdrive <url>`,
    
    async execute(sock, msg, args) {
        try {
            const jid = msg.key.remoteJid;
            if (!args[0]) return await sock.sendMessage(jid, { text: `❌ Usage: ${this.usage}` });
            
            const url = args[0];
            if (!url.includes('drive.google.com')) return await sock.sendMessage(jid, { text: '❌ Invalid Google Drive URL.' });
            
            const wait = await sock.sendMessage(jid, { text: '⏳ Fetching Google Drive file...' });
            
            const match = url.match(/[-\w]{25,}/);
            if (!match) return await sock.sendMessage(jid, { text: '❌ Could not extract file ID.', edit: wait.key });
            
            const fileId = match[0];
            const directUrl = `https://drive.google.com/uc?export=download&id=${fileId}`;
            
            await sock.sendMessage(jid, { delete: wait.key });
            
            await sock.sendMessage(jid, {
                document: { url: directUrl },
                mimetype: 'application/octet-stream',
                fileName: 'gdrive_download.bin',
                caption: `☁️ Google Drive file\n> Downloaded by VANTAGE-X MD`
            });
        } catch (error) {
            console.error('GDrive error:', error.message);
            await sock.sendMessage(msg.key.remoteJid, { text: global.mess.error });
        }
    }
};