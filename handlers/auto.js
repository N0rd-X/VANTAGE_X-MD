'use strict';

/**
 * All automatic passive features
 */

const fs = require('fs');

// ── Auto-react emoji pool ────────────────────────────────────────────────────

let autoreactData = [];
try {
    autoreactData = JSON.parse(fs.readFileSync('./lib/autoreact.json', 'utf8'));
} catch (err) {
    console.error('[AUTO] Could not load autoreact.json:', err.message);
}

// ── Status dedup set (cleared hourly) ───────────────────────────────────────

const reactedStatuses = new Set();
setInterval(() => reactedStatuses.clear(), 3_600_000);

// ── Auto-like status listener ────────────────────────────────────────────────

function attachStatusLike(sock) {
    const handler = async ({ messages }) => {
        if (!global.autolikestatus) return;

        const msg = messages[0];
        if (!msg?.message || msg.key.fromMe) return;

        const sender  = msg.key.participant || msg.key.remoteJid;
        const content = msg.message;

        let fingerprint;
        if (content.imageMessage?.fileSha256)
            fingerprint = Buffer.from(content.imageMessage.fileSha256).toString('hex');
        else if (content.videoMessage?.fileSha256)
            fingerprint = Buffer.from(content.videoMessage.fileSha256).toString('hex');
        else if (content.audioMessage?.fileSha256)
            fingerprint = Buffer.from(content.audioMessage.fileSha256).toString('hex');
        else
            fingerprint = msg.key.id;

        if (!fingerprint || reactedStatuses.has(fingerprint)) return;

        const emojis = ['❤️','🔥','💎','😍','👏','✨','💯','🌟','😎','🤍','🖤','💫'];
        const pick   = emojis[Math.floor(Math.random() * emojis.length)];

        try {
            await sock.readMessages([msg.key]);
            await sock.sendMessage(msg.key.remoteJid, {
                react: { text: pick, key: msg.key },
            }, { statusJidList: [sender] });
            reactedStatuses.add(fingerprint);
        } catch (err) {
            console.error('[AUTO-LIKE]', err.message);
        }
    };

    sock.ev.on('messages.upsert', handler);
    return handler;   // returned so caller can detach if needed
}

// ── Auto-view status listener ────────────────────────────────────────────────

function attachStatusView(sock) {
    sock.ev.on('messages.upsert', async ({ messages }) => {
        for (const msg of messages) {
            if (msg.key.remoteJid !== 'status@broadcast') continue;
            if (!msg.key.fromMe) {
                await sock.readMessages([msg.key])
                    .catch(err => console.error('[AUTO-VIEW]', err.message));
            }
        }
    });
}

// ── Per-message auto features ────────────────────────────────────────────────

/**
 * Run all per-message auto features.
 *
 * @param {object}  sock    - Baileys socket
 * @param {string}  jid     - chat JID
 * @param {object}  msgKey  - message key
 * @param {boolean} isCmd   - whether message starts with prefix
 * @param {boolean} fromMe  - whether bot sent this message
 */
async function runMessageAutos(sock, jid, msgKey, isCmd, fromMe) {
    // Auto-read
    if (global.autoread && !fromMe) {
        await sock.readMessages([msgKey])
            .catch(err => console.error('[AUTO-READ]', err.message));
    }

    // Auto-typing indicator
    if (global.autoTyping && isCmd) {
        await sock.sendPresenceUpdate('composing', jid)
            .catch(err => console.error('[AUTO-TYPING]', err.message));
    }

    // Auto-recording indicator
    if (global.autoRecording && isCmd) {
        await sock.sendPresenceUpdate('recording', jid)
            .catch(err => console.error('[AUTO-RECORDING]', err.message));
    }

    // Auto-react to incoming messages
    if (global.autoreact && !fromMe && Array.isArray(autoreactData) && autoreactData.length) {
        const pick = autoreactData[Math.floor(Math.random() * autoreactData.length)];
        await sock.sendReact(jid, pick, msgKey)
            .catch(err => console.error('[AUTO-REACT]', err.message));
    }
}

module.exports = { attachStatusLike, attachStatusView, runMessageAutos };
