'use strict';

/**
 * Owner identification and command dispatch.
*/

const config     = require('../config');
const { readDb } = require('../lib/db');

// ── Concurrency semaphore ────────────────────────────────────────────────────

const MAX_HEAVY = parseInt(process.env.MAX_CONCURRENT_HEAVY, 10) || 3;
let   heavySlots = 0;   // current number of heavy commands in flight

const BUSY_MESSAGE =
    '⏳ I\'m handling too many requests right now.\n\nPlease try again in a moment.';

// ── Owner check ──────────────────────────────────────────────────────────────
function isOwner(sender) {
    if (!sender) return false;
    const num = sender.replace(/@.+$/, '');

    if (num === String(config.ownernumber).replace(/@.+$/, '')) return true;

    const extraOwners = readDb('owner.json', []);
    return Array.isArray(extraOwners) && extraOwners.some(o => String(o).replace(/@.+$/, '') === num);
}

// ── Dispatch ─────────────────────────────────────────────────────────────────

/**
 * Resolve cmdName against the loaded command map and dispatch.
 *
 * @param {Map}    commands - name/alias → command module (from index.js's loader)
 * @param {string} cmdName  - lowercased command name, prefix already stripped
 * @param {object} sock     - Baileys socket
 * @param {object} msg      - the smsg()-wrapped message (msg.key / msg.message intact)
 * @param {array}  args     - args after the command name
 * @param {object} ctx      - extra context messages.js has assembled. Not part
 *                            of the execute() contract and not passed down —
 *                            kept here only in case a future command wants it.
 */
async function run(commands, cmdName, sock, msg, args, ctx = {}) {
    const cmd = commands.get(cmdName);
    if (!cmd) return;

    const isHeavy = cmd.weight === 'heavy';

    // ── Slot check (heavy commands only) ────────────────────────────────────
    if (isHeavy) {
        if (heavySlots >= MAX_HEAVY) {
            console.warn(`[CMD] heavy slot cap hit — dropped: ${cmdName} (${heavySlots}/${MAX_HEAVY} slots in use)`);
            await sock.sendMessage(msg.key.remoteJid, { text: BUSY_MESSAGE }, { quoted: msg }).catch(() => {});
            return;
        }
        heavySlots++;
    }

    // ── Execute ──────────────────────────────────────────────────────────────
    try {
        await cmd.execute(sock, msg, args);
    } catch (err) {
        console.error(`[CMD] ${cmdName} threw:`, err.message);
        await sock.sendMessage(msg.key.remoteJid, { text: config.mess.error }).catch(() => {});
    } finally {
        // Always release the slot, even if execute() threw
        if (isHeavy) heavySlots--;
    }
}

module.exports = { isOwner, run };
