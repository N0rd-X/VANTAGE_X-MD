const config = require('../../config');
const axios = require('axios');

module.exports = {
    name: 'dictionary',
    aliases: ['dict', 'define', 'meaning'],
    category: 'search',
    description: 'Get word definition',
    usage: `${config.prefix}dictionary <word>`,
    
    async execute(sock, msg, args) {
        try {
            const jid = msg.key.remoteJid;
            if (!args[0]) {
                return await sock.sendMessage(jid, {
                    text: `❌ Usage: ${this.usage}\n\nExample: ${config.prefix}dictionary serendipity`
                });
            }
            
            const word = args[0].toLowerCase();
            const wait = await sock.sendMessage(jid, { text: '📚 Looking up...' });
            
            const res = await axios.get(`https://api.dictionaryapi.dev/api/v2/entries/en/${word}`);
            const data = res.data[0];
            
            let text = `📖 *${data.word}* ${data.phonetic || ''}\n\n`;
            data.meanings.forEach(m => {
                text += `*${m.partOfSpeech}*\n`;
                m.definitions.slice(0, 2).forEach((d, i) => {
                    text += `${i+1}. ${d.definition}\n`;
                    if (d.example) text += `   _"${d.example}"_\n`;
                });
                text += '\n';
            });
            
            await sock.sendMessage(jid, { text: text.trim(), edit: wait.key });
        } catch (error) {
            console.error('Dictionary error:', error.message);
            await sock.sendMessage(j.key.remoteJid, { text: '❌ Word not found.' });
        }
    }
};