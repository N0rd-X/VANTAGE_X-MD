'use strict';

const config   = require('../../config');
const { send } = require('../../helpers');

const TYPES = ['base64', 'hex', 'binary', 'url', 'ascii'];

module.exports = {
    name: 'decode',
    aliases: ['dec'],
    category: 'utility',
    description: 'Decode base64, hex, binary, url or ascii',
    usage: `${config.prefix}decode <encoded text> | <type>`,

    async execute(sock, msg, args) {
        const jid = msg.key.remoteJid;
        try {
            const input = args.join(' ').trim();

            if (!input || !input.includes('|')) {
                return send(sock, jid,
                    `❌ Usage: ${this.usage}\n\n` +
                    `Examples:\n` +
                    `${config.prefix}decode SGVsbG8gV29ybGQ= | base64\n` +
                    `${config.prefix}decode 48656c6c6f | hex\n` +
                    `${config.prefix}decode 01001000 01101001 | binary\n\n` +
                    `Types: ${TYPES.join(', ')}`
                );
            }

            const lastPipe = input.lastIndexOf('|');
            const text     = input.slice(0, lastPipe).trim();
            const type     = input.slice(lastPipe + 1).trim().toLowerCase();

            if (!text)                 return send(sock, jid, '❌ Text cannot be empty.');
            if (!TYPES.includes(type)) return send(sock, jid, `❌ Unknown type *${type}*\n\nAvailable: ${TYPES.join(', ')}`);

            let result;
            if (type === 'base64') {
                result = Buffer.from(text, 'base64').toString('utf8');
            } else if (type === 'hex') {
                if (!/^[0-9a-fA-F\s]+$/.test(text)) return send(sock, jid, '❌ Invalid hex — only 0–9 and A–F allowed.');
                result = Buffer.from(text.replace(/\s/g, ''), 'hex').toString('utf8');
            } else if (type === 'binary') {
                if (!/^[01\s]+$/.test(text)) return send(sock, jid, '❌ Invalid binary — only 0s and 1s allowed.');
                result = text.trim().split(/\s+/).map(b => String.fromCharCode(parseInt(b, 2))).join('');
            } else if (type === 'url') {
                result = decodeURIComponent(text);
            } else if (type === 'ascii') {
                if (!/^[\d\s]+$/.test(text)) return send(sock, jid, '❌ Invalid ASCII — only numbers allowed.');
                result = text.trim().split(/\s+/).map(n => String.fromCharCode(parseInt(n))).join('');
            }

            await sock.sendMessage(jid, {
                text: `🔓 *${type.toUpperCase()} Decoded*\n\n${result}`
            }, { quoted: msg });

        } catch (err) {
            console.error('[decode]', err.message);
            await send(sock, jid, '❌ Could not decode — check your input and type.');
        }
    }
};
