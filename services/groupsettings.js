'use strict';

const { readDb, writeDb } = require('../lib/db');

const FILE        = 'groupsettings.json';
const MAX_MESSAGE = 1000;

const KINDS = {
    welcome: { flag: 'welcome', field: 'welcomeMsg', fallback: 'Welcome @user to *@group*! 🎉\n\n@desc' },
    goodbye: { flag: 'goodbye', field: 'goodbyeMsg', fallback: "Goodbye @user, we'll miss you! 👋" },
};

function get(jid) {
    const e = readDb(FILE, {})[jid] || {};
    return {
        welcome:    !!e.welcome,
        goodbye:    !!e.goodbye,
        welcomeMsg: typeof e.welcomeMsg === 'string' && e.welcomeMsg ? e.welcomeMsg : null,
        goodbyeMsg: typeof e.goodbyeMsg === 'string' && e.goodbyeMsg ? e.goodbyeMsg : null,
    };
}

// Merge `patch` into the group's entry. A null/undefined value removes that key.
function update(jid, patch) {
    const all   = { ...readDb(FILE, {}) };
    const entry = { ...(all[jid] || {}) };
    for (const [k, v] of Object.entries(patch)) {
        if (v === null || v === undefined) delete entry[k]; else entry[k] = v;
    }
    all[jid] = entry;
    writeDb(FILE, all);
}

const isOn     = (jid, kind) => get(jid)[KINDS[kind].flag];
const custom   = (jid, kind) => get(jid)[KINDS[kind].field];
const template = (jid, kind) => custom(jid, kind) || KINDS[kind].fallback;

// Function replacers (not strings) so "$&" or "$1" inside a group name or description stay literal.
function render(tpl, { num, group = 'this group', desc = '', count = '' }) {
    return tpl
        .replace(/@user\b/gi,  () => `@${num}`)
        .replace(/@group\b/gi, () => group)
        .replace(/@count\b/gi, () => String(count))
        .replace(/@desc\b/gi,  () => desc)
        .replace(/[ \t]+\n/g, '\n')       // tidy what an empty @desc leaves behind
        .replace(/\n{3,}/g, '\n\n')
        .trim();
}

module.exports = { get, update, isOn, custom, template, render, KINDS, MAX_MESSAGE };
