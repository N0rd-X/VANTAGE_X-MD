'use strict';

const cp   = require('child_process');
const fs   = require('fs');
const os   = require('os');
const path = require('path');
const util = require('util');

// ── 1. exec() guard ──────────────────────────────────────────────────────────

const EXEC_TIMEOUT_MS = parseInt(process.env.EXEC_TIMEOUT_MS, 10) || 120_000;
const EXEC_MAX_BUFFER = 64 * 1024 * 1024;

const DEFAULTS = {
    timeout:    EXEC_TIMEOUT_MS,
    maxBuffer:  EXEC_MAX_BUFFER,
    killSignal: 'SIGKILL',
};

const origExec         = cp.exec;
const origExecPromised = util.promisify(origExec);   // resolves { stdout, stderr }

function guardedExec(cmd, options, callback) {
    if (typeof options === 'function') { callback = options; options = {}; }
    return origExec(cmd, { ...DEFAULTS, ...(options || {}) }, callback);
}

// Keep `promisify(exec)` returning { stdout, stderr } like the real exec does
guardedExec[util.promisify.custom] = (cmd, options) =>
    origExecPromised(cmd, { ...DEFAULTS, ...(options || {}) });

if (!cp.exec.__guarded) {
    guardedExec.__guarded = true;
    cp.exec = guardedExec;
}

// ── 2. Temp-file janitor ─────────────────────────────────────────────────────

const TEMP_RE = /^(audio|bass|blurred?|gif|outd?|output|outr|outv|vid|written|write|sticker|dem|nc|ocr|pdf|qr|rev|revv|rob|slow|vx)_\d+/;
const MAX_AGE = 10 * 60 * 1000;   // leave anything younger than 10 min alone
const SWEEP_EVERY = 10 * 60 * 1000;

function sweepTemp() {
    const cutoff = Date.now() - MAX_AGE;
    for (const dir of new Set(['/tmp', os.tmpdir()])) {
        let names;
        try { names = fs.readdirSync(dir); } catch { continue; }

        for (const name of names) {
            if (!TEMP_RE.test(name)) continue;
            const full = path.join(dir, name);
            try {
                const st = fs.statSync(full);
                if (st.isFile() && st.mtimeMs < cutoff) fs.unlinkSync(full);
            } catch { /* already gone / in use */ }
        }
    }
}

sweepTemp();
setInterval(sweepTemp, SWEEP_EVERY).unref();

module.exports = { sweepTemp };
