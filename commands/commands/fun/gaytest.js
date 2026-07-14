const config = require('../../config');

module.exports = {
    name: 'gaytest',
    aliases: ['gay', 'howgay'],
    category: 'fun',
    description: 'Test how gay someone is (joke)',
    usage: `${config.prefix}gaytest @user`,
    
    async execute(sock, msg, args) {
        try {
            const jid = msg.key.remoteJid;
            const mentioned = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid || [];
            const target = mentioned[0] || msg.key.participant || msg.key.remoteJid;
            
            const percent = Math.floor(Math.random() * 101);
            let bar = '';
            for (let i = 0; i < 10; i++) bar += i < Math.floor(percent / 10) ? '🏳️‍🌈' : '⬜';
            
            await sock.sendMessage(jid, {
                text: `🌈 *Gay Test*\n\n@${target.split('@')[0]}\n\n${bar} ${percent}%\n\n${percent > 80 ? 'Fabulous!' : percent > 50 ? 'Questionable...' : 'Straight as an arrow.'}`,
                mentions: [target]
            });
        } catch (error) {
            console.error('GayTest error:', error.message);
            await sock.sendMessage(msg.key.remoteJid, { text: global.mess.error });
        }
    }
};