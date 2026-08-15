'use strict';

const config     = require('../config');
const { readDb } = require('../lib/db');

// ── Concurrency semaphore ────────────────────────────────────────────────────

const MAX_HEAVY = parseInt(process.env.MAX_CONCURRENT_HEAVY, 10) || 3;
let   heavySlots = 0;

const BUSY_MESSAGE =
    '⏳ I\'m handling too many requests right now.\n\nPlease try again in a moment.';

// ── Owner check ───────────────────────────────────────────────────────────────

function isOwner(sender) {
    if (!sender) return false;

    // Strip @server and :device suffixes
    const normalise = (v) => String(v || '').replace(/@.+$/, '').replace(/:\d+$/, '');
    const num = normalise(sender);

    // Primary owner from config/env
    const primary = normalise(config.ownernumber || process.env.OWNER_NUMBER || '');
    if (primary && num === primary) return true;

    // Additional owners from database/owner.json (array of numbers)
    const extras = readDb('owner.json', []);
    if (Array.isArray(extras)) {
        return extras.some(o => normalise(o) === num);
    }

    return false;
}

// ── Dispatch ──────────────────────────────────────────────────────────────────

async function run(commands, cmdName, sock, msg, args, sender) {
    const cmd = commands.get(cmdName);
    if (!cmd) return;

    const jid = msg.key.remoteJid;

    // ── Owner-only guard ──────────────────────────────────────────────────────
    if (cmd.ownerOnly && !isOwner(sender)) {
        await sock.sendMessage(jid, {
            text: global.mess?.owner ?? '⛔ This command is restricted to the bot owner.'
        }, { quoted: msg }).catch(() => {});
        return;
    }

    // ── Concurrency cap (heavy commands only) ─────────────────────────────────
    const isHeavy = cmd.weight === 'heavy';
    if (isHeavy) {
        if (heavySlots >= MAX_HEAVY) {
            console.warn(`[CMD] heavy cap hit — dropped: ${cmdName} (${heavySlots}/${MAX_HEAVY})`);
            await sock.sendMessage(jid, { text: BUSY_MESSAGE }, { quoted: msg }).catch(() => {});
            return;
        }
        heavySlots++;
    }

    // ── Execute ───────────────────────────────────────────────────────────────
    try {
        await cmd.execute(sock, msg, args);
    } catch (err) {
        console.error(`[CMD] ${cmdName} threw:`, err.message);
        await sock.sendMessage(jid, { text: config.mess?.error ?? '❌ An error occurred.' }).catch(() => {});
    } finally {
        if (isHeavy) heavySlots--;
    }
}

module.exports = { isOwner, run };
