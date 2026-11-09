'use strict';

// Centralised database access with in-memory cache.

const fs   = require('fs');
const path = require('path');

const DB_DIR    = path.join(__dirname, '..', 'database');
const cache     = new Map();           // key → { data, ts }
const TTL       = 10_000;             // 10 seconds cache TTL

function readDb(file, defaultValue = {}) {
    const now    = Date.now();
    const cached = cache.get(file);

    if (cached && (now - cached.ts) < TTL) {
        return cached.data;
    }

    const filePath = path.join(DB_DIR, file);

    let raw;
    try {
        raw = fs.readFileSync(filePath, 'utf8');
    } catch (err) {
        if (err.code !== 'ENOENT') {
            console.error(`[DB] Could not read ${file}:`, err.message);
        } else {
            // Missing file is the normal first-run case — remember that for the TTL
            // so we don't hit the disk on every single message.
            cache.set(file, { data: defaultValue, ts: now });
        }
        return defaultValue;
    }

    try {
        const data = JSON.parse(raw);
        cache.set(file, { data, ts: now });
        return data;
    } catch (err) {
        console.error(`[DB] ⚠️  ${file} exists but is corrupted and could not be parsed:`, err.message);
        return defaultValue;
    }
}

function writeDb(file, data) {
    const filePath = path.join(DB_DIR, file);
    const tempPath = `${filePath}.${process.pid}.tmp`;

    fs.writeFileSync(tempPath, JSON.stringify(data, null, 2));
    fs.renameSync(tempPath, filePath);

    cache.delete(file);                // force fresh read next time
}

// Manually invalidate a cache entry.
function invalidate(file) {
    cache.delete(file);
}

module.exports = { readDb, writeDb, invalidate };
