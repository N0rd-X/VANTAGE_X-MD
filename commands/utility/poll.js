const config = require('../../config');

const polls = new Map();

module.exports = {
    name: 'poll',
    aliases: ['vote', 'createpoll'],
    category: 'utility',
    description: 'Create a poll',
    usage: `${config.prefix}poll "question" | option1 | option2 | option3`,
    async execute(sock, msg, args) {
        try {
            const jid = msg.key.remoteJid;
            if (!args[0]) return await sock.sendMessage(jid, { text: `❌ Usage: ${this.usage}` });
            const full = args.join(' ');
            const parts = full.split('|').map(p => p.trim());
            if (parts.length < 3) return await sock.sendMessage(jid, { text: '❌ Need a question and at least 2 options.' });
            const [question, ...options] = parts;
            polls.set(jid, { question, options, votes: Array(options.length).fill(0), voters: new Set() });
            let text = `📊 *Poll: ${question}*\n\n`;
            options.forEach((o, i) => text += `${i + 1}. ${o} — 0 votes\n`);
            text += `\nReply with the number to vote!`;
            await sock.sendMessage(jid, { text });
        } catch (e) { console.error(e.message); await sock.sendMessage(msg.key.remoteJid, { text: global.mess.error }); }
    }
};

module.exports.vote = async (sock, msg, text) => {
    const jid = msg.key.remoteJid;
    const poll = polls.get(jid);
    if (!poll) return false;
    const choice = parseInt(text) - 1;
    if (isNaN(choice) || choice < 0 || choice >= poll.options.length) return false;
    const sender = msg.key.participant || msg.key.remoteJid;
    if (poll.voters.has(sender)) { await sock.sendMessage(jid, { text: '❌ You already voted!' }); return true; }
    poll.votes[choice]++;
    poll.voters.add(sender);
    let result = `📊 *Poll: ${poll.question}*\n\n`;
    poll.options.forEach((o, i) => result += `${i + 1}. ${o} — ${poll.votes[i]} votes\n`);
    await sock.sendMessage(jid, { text: result });
    return true;
};