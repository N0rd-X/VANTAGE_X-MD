'use strict';

const config     = require('../config');
const { readDb } = require('../lib/db');

// ── Concurrency semaphore ────────────────────────────────────────────────────

const MAX_HEAVY = parseInt(process.env.MAX_CONCURRENT_HEAVY, 10) || 3;
let   heavySlots = 0;

const BUSY_MESSAGE =
    'Handling too many requests right now.\n\nPlease try again in a moment.';

// ── Owner check ───────────────────────────────────────────────────────────────

const normalise = (v) => String(v || '').replace(/^\+/, '').replace(/@.+$/, '').replace(/:\d+$/, '');

const _startupOwner = normalise(config.ownernumber || process.env.OWNER_NUMBER || '');
if (!_startupOwner) {
    console.warn('[AUTH] ⚠️  No owner number configured — set OWNER_NUMBER in .env / environment variables');
} else {
    console.log('[AUTH] Owner number loaded:', _startupOwner);
}

function isOwner(sender) {
    if (!sender) return false;

    const num = normalise(sender);

    // Check every possible source the owner number could live in
    const settings   = readDb('settings.json', {});
    const candidates = [
        config.ownernumber,
        global.ownernumber,
        settings.ownernumber,
        process.env.OWNER_NUMBER,
    ].filter(Boolean).map(normalise);

    if (candidates.some(c => c === num)) return true;

    // Additional owners from database/owner.json
    const extras = readDb('owner.json', []);
    if (Array.isArray(extras) && extras.some(o => normalise(o) === num)) return true;

    return false;
}

// ── Dispatch ──────────────────────────────────────────────────────────────────

async function run(commands, cmdName, sock, msg, args, sender) {
    const cmd = commands.get(cmdName);
    if (!cmd) return;

    const jid = msg.key.remoteJid;

    // ── Owner-only guard ──────────────────────────────────────────────────────
    if (cmd.ownerOnly) {
        const fromMe = msg.key.fromMe;
        if (!fromMe && !isOwner(sender)) {
            const settings    = readDb('settings.json', {});
            const _candidates = [config.ownernumber, global.ownernumber, settings.ownernumber, process.env.OWNER_NUMBER]
                .filter(Boolean).map(normalise).join(' / ');
            console.warn(`[AUTH] Denied "${cmdName}" — sender: ${normalise(sender)} | configured owner(s): ${_candidates || '(none)'}`);
            await sock.sendMessage(jid, {
                text: global.mess?.owner ?? '⛔ This command is restricted to the bot owner.'
            }, { quoted: msg }).catch(() => {});
            return;
        }
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
