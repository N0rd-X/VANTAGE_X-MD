const config = require('../../config');

const responses = [
    // Positive
    '🎱 It is certain.',
    '🎱 It is decidedly so.',
    '🎱 Without a doubt.',
    '🎱 Yes, definitely.',
    '🎱 You may rely on it.',
    '🎱 As I see it, yes.',
    '🎱 Most likely.',
    '🎱 Outlook good.',
    '🎱 Yes.',
    '🎱 Signs point to yes.',
    // Neutral
    '🎱 Reply hazy, try again.',
    '🎱 Ask again later.',
    '🎱 Better not tell you now.',
    '🎱 Cannot predict now.',
    '🎱 Concentrate and ask again.',
    // Negative
    '🎱 Don\'t count on it.',
    '🎱 My reply is no.',
    '🎱 My sources say no.',
    '🎱 Outlook not so good.',
    '🎱 Very doubtful.'
];

module.exports = {
    name: '8ball',
    aliases: ['8b', 'magic8', 'eightball'],
    category: 'fun',
    description: 'Ask the magic 8 ball a question',
    usage: `${config.prefix}8ball <question>`,

    async execute(sock, msg, args) {
        try {
            const jid = msg.key.remoteJid;

            if (!args[0]) {
                return await sock.sendMessage(jid, {
                    text: `❌ Usage: ${this.usage}\n\nExample: ${config.prefix}8ball Will I win today?`
                });
            }

            const question = args.join(' ');
            const answer = responses[Math.floor(Math.random() * responses.length)];
            const sender = msg.pushName || 'User';

            await sock.sendMessage(jid, {
                text: `🎱 *Magic 8 Ball*\n\n*${sender} asks:* ${question}\n\n${answer}`
            });

        } catch (error) {
            console.error('8ball error:', error.message);
            await sock.sendMessage(msg.key.remoteJid, { text: global.mess.error });
        }
    }
};