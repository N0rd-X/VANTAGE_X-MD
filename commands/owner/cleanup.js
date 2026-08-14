const config = require('../../config');
const fs = require('fs').promises;
const path = require('path');

module.exports = {
    name: 'cleanup',
    aliases: ['clear', 'clean'],
    category: 'owner',
    description: 'Clean temp files and restart',
    usage: `${config.prefix}cleanup`,
    ownerOnly: true,
    
    async execute(sock, msg, args) {
        try {
            const jid = msg.key.remoteJid;
            const sender = msg.key.participant || msg.key.remoteJid;
            const ownerJid = `${config.ownernumber}@s.whatsapp.net`;
            
            if (sender !== ownerJid) return await sock.sendMessage(jid, { text: '⛔ Owner only.' });
            
            await sock.sendMessage(jid, { text: '🧹 Cleaning up temp files...' });
            
            const tmpDir = '/tmp';
            const files = await fs.readdir(tmpDir);
            let deleted = 0;
            
            for (const file of files) {
                if (file.startsWith('sticker_') || file.startsWith('yt_') || file.startsWith('vid_') || file.startsWith('audio_') || file.startsWith('gif_') || file.startsWith('blur_') || file.startsWith('nc_') || file.startsWith('slow_') || file.startsWith('qr_') || file.startsWith('ocr_') || file.startsWith('write_') || file.startsWith('pdf_') || file.startsWith('song_') || file.startsWith('play_')) {
                    await fs.unlink(path.join(tmpDir, file)).catch(() => {});
                    deleted++;
                }
            }
            
            await sock.sendMessage(jid, { text: `✅ Cleaned up ${deleted} temp files.` });
        } catch (error) {
            console.error('Cleanup error:', error.message);
            await sock.sendMessage(msg.key.remoteJid, { text: global.mess.error });
        }
    }
};