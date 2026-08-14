const config = require('../../config');

const MORSE = {
    A: '.-', B: '-...', C: '-.-.', D: '-..', E: '.', F: '..-.', G: '--.', H: '....', I: '..', J: '.---',
    K: '-.-', L: '.-..', M: '--', N: '-.', O: '---', P: '.--.', Q: '--.-', R: '.-.', S: '...', T: '-',
    U: '..-', V: '...-', W: '.--', X: '-..-', Y: '-.--', Z: '--..', '1': '.----', '2': '..---', '3': '...--',
    '4': '....-', '5': '.....', '6': '-....', '7': '--...', '8': '---..', '9': '----.', '0': '-----',
    ' ': ' / '
};

const REVERSE = Object.fromEntries(Object.entries(MORSE).map(([k, v]) => [v, k]));

module.exports = {
    name: 'morse',
    aliases: ['morsecode'],
    category: 'utility',
    description: 'Text to Morse code and back',
    usage: `${config.prefix}morse <text>`,
    async execute(sock, msg, args) {
        try {
            const jid = msg.key.remoteJid;
            if (!args[0]) return await sock.sendMessage(jid, { text: `❌ Usage: ${this.usage}` });
            const text = args.join(' ');
            if (text.includes('.') || text.includes('-')) {
                // Decode
                const result = text.split(' / ').map(w => w.split(' ').map(c => REVERSE[c] || '').join('')).join(' ');
                await sock.sendMessage(jid, { text: `📻 *Decoded:*\n\n${result}` });
            } else {
                // Encode
                const result = text.toUpperCase().split('').map(c => MORSE[c] || c).join(' ');
                await sock.sendMessage(jid, { text: `📻 *Morse:*\n\n${result}` });
            }
        } catch (e) { console.error(e.message); await sock.sendMessage(msg.key.remoteJid, { text: global.mess.error }); }
    }
};