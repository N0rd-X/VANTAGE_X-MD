const config = require('../../config');

module.exports = {
    name: 'ping',
    aliases: ['speed', 'latency'],
    category: 'utility',
    description: 'Check bot response time',
    usage: `${config.prefix}ping`,
    
    async execute(sock, msg, args) {
        try {
            const start = Date.now();
            const jid = msg.key.remoteJid;
            
            const sent = await sock.sendMessage(jid, {
                text: '```Pinging...```'
            });
            
            const latency = Date.now() - start;
            
            await sock.sendMessage(jid, {
                text: `╔═══════════════╗
║   🏓 PONG!    ║
╠═══════════════╣
║ Speed: ${latency}ms   ║
╚═══════════════╝`,
                edit: sent.key
            });
            
        } catch (error) {
            console.error('Ping error:', error);
            await sock.sendMessage(msg.key.remoteJid, {
                text: '❌ Error checking ping'
            });
        }
    }
};