'use strict';

/**
 * Handles incoming calls based on anti-call configuration.
 */

const { readDb } = require('../lib/db');

/**
 * Attach the call handler to the socket.
 *
 * @param {object} sock - Baileys socket
 */
function attach(sock) {
    sock.ev.on('call', async (calls) => {
        const cfg = readDb('anticall.json', { enabled: false, mode: 'reject' });
        if (!cfg.enabled) return;

        for (const call of calls) {
            if (call.status !== 'offer') continue;

            const caller = call.from;

            // Always reject the call
            await sock.rejectCall(call.id, caller)
                .catch(err => console.error('[CALLS] rejectCall failed:', err.message));

            if (cfg.mode === 'message') {
                await sock.sendMessage(caller, {
                    text: '❌ Sorry, I don\'t accept calls. Please send a message instead.',
                }).catch(err => console.error('[CALLS] warn message failed:', err.message));

            } else if (cfg.mode === 'block') {
                await sock.sendMessage(caller, {
                    text: '⛔ Calls are not allowed. You have been blocked.',
                }).catch(err => console.error('[CALLS] block message failed:', err.message));

                await sock.updateBlockStatus(caller, 'block')
                    .catch(err => console.error('[CALLS] block failed:', err.message));
            }
        }
    });
}

module.exports = { attach };
