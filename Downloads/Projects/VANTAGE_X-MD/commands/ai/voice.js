const config = require('../../config');
const axios = require('axios');

module.exports = {
    name: 'voice',
    aliases: ['tts', 'say'],
    category: 'ai',
    description: 'Text to speech',
    weight: 'heavy'
    usage: `${config.prefix}voice <text>`,
    
    async execute(sock, msg, args) {
        try {
            const jid = msg.key.remoteJid;
            if (!args[0]) return await sock.sendMessage(jid, { text: `❌ Usage: ${this.usage}` });
            
            const text = args.join(' ');
            const wait = await sock.sendMessage(jid, { text: '🔊 Generating voice...' });
            
            // Using Google TTS unofficial endpoint
            const ttsUrl = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(text)}&tl=en&client=tw-ob`;
            
            await sock.sendMessage(jid, { delete: wait.key });
            
            await sock.sendMessage(jid, {
                audio: { url: ttsUrl },
                mimetype: 'audio/mp3',
                ptt: true // voice note
            });
        } catch (error) {
            console.error('Voice error:', error.message);
            await sock.sendMessage(msg.key.remoteJid, { text: global.mess.error });
        }
    }
};