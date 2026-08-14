'use strict';
const config = require('../../config');
const { send } = require('../../helpers');

const MESSAGE = '🚧 *AI commands are currently still in development.*\n\nStay tuned for updates!';

module.exports = {
    name: 'ai',
    aliases: [
        'chatgpt', 'gpt', 'openai',
        'claude', 'anthropic',
        'gemini', 'gem',
        'deepseek', 'ds',
        'metaai', 'meta', 'llama',
        'perplexity', 'perp',
        'nanobanana', 'nano', 'nbanana',
        'detect', 'vision', 'whatis',
    ],
    category: 'ai',
    description: 'Features in development',
    usage: `${config.prefix}ai`,

    async execute(sock, msg, args) {
        const jid = msg.key.remoteJid;
        try {
            await send(sock, jid, MESSAGE);
        } catch (err) {
            console.error('[ai]', err.message);
        }
    },
};