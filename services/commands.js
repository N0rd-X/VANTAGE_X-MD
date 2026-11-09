'use strict';

const config     = require('../config');
const { readDb, writeDb } = require('../lib/db');

// ── Concurrency semaphore ────────────────────────────────────────────────────

const MAX_HEAVY = parseInt(process.env.MAX_CONCURRENT_HEAVY, 10) || 3;
let   heavySlots = 0;

const BUSY_MESSAGE =
    'Handling too many requests right now.\n\nPlease try again in a moment.';

// ── Owner check ───────────────────────────────────────────────────────────────

// Reduce any JID / phone string to bare digits, so every device of one account normalises equally
const normalise = (v) => {
    let s = String(v || '');
    if (s.includes('@')) s = s.replace(/@.+$/, '').replace(/_\d+$/, '');
    return s.replace(/:\d+$/, '').replace(/\D/g, '');
};

const isLid = (id) => String(id || '').endsWith('@lid');

const _startupOwner = normalise(config.ownernumber || process.env.OWNER_NUMBER || '');
if (!_startupOwner) {
    console.warn('[AUTH] ⚠️  No owner number configured — will fallback to default owner');
} else {
    console.log('[AUTH] Owner number loaded:', _startupOwner);
}

// Owner phone numbers (primary) and auto-learned owner LIDs (fallback).
function ownerSets() {
    const settings = readDb('settings.json', {});
    const extras   = readDb('owner.json', []);

    const numbers = new Set([
        config.ownernumber,
        global.ownernumber,
        settings.ownernumber,
        process.env.OWNER_NUMBER,
        ...(Array.isArray(extras) ? extras : []),
    ].filter(Boolean).map(normalise).filter(Boolean));

    const lids = new Set((Array.isArray(settings.ownerlids) ? settings.ownerlids : []).map(normalise).filter(Boolean));
    return { numbers, lids };
}

const matchesNumber = (ids, numbers) => ids.some(id => !isLid(id) && numbers.has(normalise(id)));

function isOwner(...ids) {
    const flat = ids.flat().filter(Boolean);
    const { numbers, lids } = ownerSets();

    if (matchesNumber(flat, numbers)) return true;
    return flat.some(id => isLid(id) && lids.has(normalise(id)));
}

function learnOwnerLid(...ids) {
    const flat = ids.flat().filter(Boolean);
    const lid  = flat.find(isLid);
    if (!lid) return;

    const { numbers, lids } = ownerSets();
    if (!matchesNumber(flat, numbers)) return;

    const digits = normalise(lid);
    if (!digits || lids.has(digits)) return;

    try {
        const settings = readDb('settings.json', {});
        writeDb('settings.json', { ...settings, ownerlids: [...lids, digits] });
        console.log('[AUTH] Owner LID learned and saved.');
    } catch (err) {
        console.error('[AUTH] Could not save owner LID:', err.message);
    }
}

// ── Bot mode ─────────────────────────────────────────────────────────────────

const MODES = ['public', 'private', 'inbox', 'group'];
let _modeWarned = false;

const MODE_INFO = {
    public:  'anyone can use the bot, anywhere',
    private: 'only the owner can use the bot',
    inbox:   'anyone can use the bot, in private chats only',
    group:   'anyone can use the bot, in group chats only',
};

function getMode() {
    const saved = readDb('settings.json', {}).mode;
    const raw   = String(saved || process.env.BOT_MODE || 'public').trim().toLowerCase();
    if (MODES.includes(raw)) return raw;

    if (!_modeWarned) {
        _modeWarned = true;
        console.warn(`[MODE] ⚠️  Invalid mode "${saved || process.env.BOT_MODE}" — using "private". ` +
                    `Valid modes: ${MODES.join(', ')}`);
    }
    return 'private';
}

// Validate, apply and persist a new mode. Returns the mode, or null if it isn't valid.
function setMode(next) {
    const mode = String(next || '').trim().toLowerCase();
    if (!MODES.includes(mode)) return null;

    const settings = readDb('settings.json', {});
    writeDb('settings.json', { ...settings, mode });
    _modeWarned = false;
    return mode;
}

function modeAllows(mode, { isGroup, isOwner: byOwner }) {
    switch (mode) {
        case 'private': return !!byOwner;
        case 'inbox':   return !isGroup;
        case 'group':   return !!isGroup;
        default:        return true;          // public
    }
}

// ── Dispatch ──────────────────────────────────────────────────────────────────

async function run(commands, cmdName, sock, msg, args, sender, ids) {
    const cmd = commands.get(cmdName);
    if (!cmd) return;

    const jid = msg.key.remoteJid;

    // ── Owner-only guard ──────────────────────────────────────────────────────
    if (cmd.ownerOnly) {
        const fromMe = msg.key.fromMe;
        if (!fromMe && !isOwner(...(ids && ids.length ? ids : [sender]))) {
            const tried = (ids && ids.length ? ids : [sender]).map(normalise).filter(Boolean).join(', ');
            console.warn(`[AUTH] Denied "${cmdName}" — sender id(s): ${tried || '(none)'} | ` +
                        `configured owner(s): ${[...ownerSets().numbers].join(' / ') || '(none)'}`);
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

module.exports = { isOwner, learnOwnerLid, getMode, setMode, modeAllows, MODES, MODE_INFO, run };

