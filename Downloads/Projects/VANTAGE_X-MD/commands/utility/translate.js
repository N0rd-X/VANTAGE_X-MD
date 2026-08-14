const config = require('../../config');
const axios = require('axios');

module.exports = {
    name: 'translate',
    aliases: ['tr', 'trans'],
    category: 'utility',
    description: 'Translate text to another language',
    usage: `${config.prefix}translate <lang> <text>`,
    
    async execute(sock, msg, args) {
        try {
            const jid = msg.key.remoteJid;
            if (args.length < 2) {
                return await sock.sendMessage(jid, {
                    text: `❌ Usage: ${this.usage}\n\nExample: ${config.prefix}translate es Hello world`
                });
            }
            
            const lang = args[0];
            const text = args.slice(1).join(' ');
            
            const wait = await sock.sendMessage(jid, { text: '🌐 Translating...' });
            
            const res = await axios.get(`https://api.mymemory.translated.net/get`, {
                params: { q: text, langpair: `en|${lang}` }
            });
            
            const translated = res.data?.responseData?.translatedText || 'Translation failed';
            
            await sock.sendMessage(jid, {
                text: `🌐 *Translation*\n\n` +
                      `*From:* ${text}\n` +
                      `*To (${lang}):* ${translated}`,
                edit: wait.key
            });
        } catch (error) {
            console.error('Translate error:', error.message);
            await sock.sendMessage(msg.key.remoteJid, { text: global.mess.error });
        }
    }
};