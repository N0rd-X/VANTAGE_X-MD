const config = require('../../config');
const yts = require('yt-search');
const ytdl = require('ytdl-core');
const fs = require('fs').promises;
const path = require('path');

module.exports = {
    name: 'video',
    aliases: ['vid', 'ytvid','ytmp4'],
    category: 'download',
    description: 'Download YouTube video',
    weight: 'heavy'
    usage: `${config.prefix}video <query>`,
    
    async execute(sock, msg, args) {
        try {
            const jid = msg.key.remoteJid;
            if (!args[0]) return await sock.sendMessage(jid, { text: `❌ Usage: ${this.usage}` });
            
            const query = args.join(' ');
            await sock.sendMessage(jid, { text: '🔍 Searching...' });
            
            const search = await yts(query);
            if (!search.videos.length) return await sock.sendMessage(jid, { text: '❌ No results found.' });
            
            const video = search.videos[0];
            if (video.seconds > 300) return await sock.sendMessage(jid, { text: '❌ Max 5 minutes for video.' });
            
            await sock.sendMessage(jid, {
                text: `📥 Downloading video: *${video.title}*`
            });
            
            const tempFile = path.join('/tmp', `vid_${Date.now()}.mp4`);
            const stream = ytdl(video.url, { quality: 'lowest', filter: 'audioandvideo' });
            const writeStream = require('fs').createWriteStream(tempFile);
            stream.pipe(writeStream);
            
            await new Promise((resolve, reject) => {
                writeStream.on('finish', resolve);
                writeStream.on('error', reject);
            });
            
            const buffer = await fs.readFile(tempFile);
            await sock.sendMessage(jid, {
                video: buffer,
                caption: `📹 ${video.title}`,
                mimetype: 'video/mp4'
            });
            
            await fs.unlink(tempFile).catch(() => {});
        } catch (error) {
            console.error('Video error:', error.message);
            await sock.sendMessage(msg.key.remoteJid, { text: global.mess.error });
        }
    }
};