'use strict';

const config = require('../../config');
const { send, getGroupContext } = require('../../helpers');
const { downloadContentFromMessage } = require('@whiskeysockets/baileys');

module.exports = {
    name: 'hidetag',
    aliases: ['hall', 'htag'],
    category: 'group',
    description: 'Tags all group members silently',
    usage: `${config.prefix}hidetag [message]/(reply)`,
    async execute(sock, msg, args) {
        const jid = msg.key.remoteJid;
        try {
            if (!jid.endsWith('@g.us')) return send(sock, jid, global.mess.group);
            
            const ctx = await getGroupContext(sock, msg);
            if (!ctx.senderIsAdmin) return send(sock, jid, global.mess.admin);

            const participants = ctx.meta.participants.map(p => p.id);
            const ctxInfo = msg.message?.extendedTextMessage?.contextInfo;
            const quoted  = ctxInfo?.quotedMessage;

            // ── Replying to a message ────────
            if (quoted && !args.length) {
                const msgType = Object.keys(quoted)[0];
                
                if (msgType === 'conversation' || msgType === 'extendedTextMessage') {
                    const text = quoted.conversation || quoted.extendedTextMessage?.text || '';
                    return await sock.sendMessage(jid, { text, mentions: participants });
                }
                
                if (msgType === 'imageMessage') {
                    const stream = await downloadContentFromMessage(quoted.imageMessage, 'image');
                    let buffer = Buffer.alloc(0);
                    for await (const chunk of stream) buffer = Buffer.concat([buffer, chunk]);
                    return await sock.sendMessage(jid, {
                        image: buffer,
                        caption: quoted.imageMessage.caption || '',
                        mentions: participants
                    });
                }
                
                if (msgType === 'videoMessage') {
                    const stream = await downloadContentFromMessage(quoted.videoMessage, 'video');
                    let buffer = Buffer.alloc(0);
                    for await (const chunk of stream) buffer = Buffer.concat([buffer, chunk]);
                    return await sock.sendMessage(jid, {
                        video: buffer,
                        caption: quoted.videoMessage.caption || '',
                        mentions: participants
                    });
                }
                
                if (msgType === 'stickerMessage') {
                    const stream = await downloadContentFromMessage(quoted.stickerMessage, 'sticker');
                    let buffer = Buffer.alloc(0);
                    for await (const chunk of stream) buffer = Buffer.concat([buffer, chunk]);
                    return await sock.sendMessage(jid, { sticker: buffer, mentions: participants });
                }
                // Unsupported quoted type (e.g., audio/document) — fall through to text check
            }

            // ── No reply or unsupported reply ──────────────
            if (!args.length) {
                return send(sock, jid, `❌ Please reply to a message or provide text to send.\n\nUsage: ${this.usage}`, { quoted: msg });
            }

            const text = args.join(' ').trim();
            await sock.sendMessage(jid, { text, mentions: participants });
        } catch (err) {
            console.error('[hidetag]', err.message);
            await send(sock, jid, global.mess.error);
        }
    }
};
