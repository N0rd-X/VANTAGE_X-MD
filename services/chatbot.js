'use strict';

/**
 * Passive chat-mode replies
 */

const MESSAGE = '🚧 *AI features are currently still in development.*\n\nStay tuned for updates!';

/**
 * @param {object} sock    - Baileys socket
 * @param {string} jid     - chat JID
 * @param {string} sender  - sender JID (unused for now — kept in the
 *                           signature since handlers/messages.js already
 *                           calls with it; a real implementation will need it)
 * @param {string} body    - message text
 * @param {object} rawMsg  - original message, for quoting the reply
 */
async function handle(sock, jid, sender, body, rawMsg) {
    try {
        await sock.sendMessage(jid, { text: MESSAGE }, { quoted: rawMsg });
    } catch (err) {
        console.error('[chatbot]', err.message);
    }
}

module.exports = { handle };
