'use strict';

const http  = require('http');
const https = require('https');

const INTERVAL_MS = 14 * 60 * 1000;   // 14 minutes

function resolveUrl() {
    // Render injects RENDER_EXTERNAL_URL automatically — most reliable
    if (process.env.RENDER_EXTERNAL_URL) return process.env.RENDER_EXTERNAL_URL;
    if (process.env.PUBLIC_URL)          return process.env.PUBLIC_URL;

    // Local fallback — still works, just pings localhost
    const port = process.env.PORT || 3000;
    return `http://localhost:${port}`;
}

function ping(url) {
    const target   = url.endsWith('/health') ? url : `${url}/health`;
    const client   = target.startsWith('https') ? https : http;
    const req      = client.get(target, { timeout: 10_000 }, (res) => {
        if (res.statusCode === 200) {
            console.log(`[KEEPALIVE] ✅ ${new Date().toISOString()} — ${target}`);
        } else {
            console.warn(`[KEEPALIVE] ⚠️  ${target} responded ${res.statusCode}`);
        }
        res.resume();   // drain to free socket
    });
    req.on('error', (err) => {
        console.warn(`[KEEPALIVE] ❌ ping failed: ${err.message}`);
    });
    req.on('timeout', () => {
        req.destroy();
        console.warn('[KEEPALIVE] ❌ ping timed out');
    });
}

function startKeepalive() {
    if (process.env.KEEPALIVE !== 'true') return;

    const url = resolveUrl();
    console.log(`[KEEPALIVE] 🔄 Active — pinging ${url}/health every 14 minutes`);

    // First ping after 1 minute (give the server time to start)
    setTimeout(() => {
        ping(url);
        setInterval(() => ping(url), INTERVAL_MS);
    }, 60_000);
}

module.exports = { startKeepalive };
