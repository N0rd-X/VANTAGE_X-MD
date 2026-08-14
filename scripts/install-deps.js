'use strict';

const { execSync } = require('child_process');

const OK   = '\x1b[32m✅\x1b[0m';
const WARN = '\x1b[33m⚠️ \x1b[0m';
const INFO = '\x1b[36mℹ️ \x1b[0m';

function checkBinary(bin) {
    const cmd = process.platform === 'win32' ? `where ${bin}` : `which ${bin}`;
    try { execSync(cmd, { stdio: 'ignore' }); return true; } catch { return false; }
}

// ── yt-dlp ────────────────────────────────────────────────────────────────────

function installYtDlp() {
    if (checkBinary('yt-dlp')) {
        console.log(`${OK} yt-dlp already installed`);
        // Always try a quiet upgrade — stale extractors break downloaders
        try {
            execSync('yt-dlp -U --quiet', { stdio: 'ignore', timeout: 30_000 });
            console.log(`${INFO} yt-dlp: checked for updates`);
        } catch { /* non-fatal */ }
        return;
    }

    console.log(`${INFO} yt-dlp not found — attempting install...`);

    // Try pip variants in order
    const pipAttempts = [
        'pip3 install -U yt-dlp',
        'pip install -U yt-dlp',
        'python3 -m pip install -U yt-dlp',
        'python -m pip install -U yt-dlp',
    ];

    for (const cmd of pipAttempts) {
        try {
            execSync(cmd, { stdio: 'ignore', timeout: 60_000 });
            if (checkBinary('yt-dlp')) {
                console.log(`${OK} yt-dlp installed via: ${cmd}`);
                return;
            }
        } catch { /* try next */ }
    }

    // Last resort: direct binary (Linux x64 / ARM64 only)
    if (process.platform === 'linux') {
        try {
            const arch  = process.arch === 'arm64' ? '_aarch64' : '';
            const fname = `yt-dlp${arch}`;
            const dest  = '/usr/local/bin/yt-dlp';
            execSync(
                `curl -fsSL https://github.com/yt-dlp/yt-dlp/releases/latest/download/${fname} -o ${dest} && chmod +x ${dest}`,
                { stdio: 'ignore', timeout: 60_000 }
            );
            if (checkBinary('yt-dlp')) {
                console.log(`${OK} yt-dlp downloaded from GitHub releases (${fname})`);
                return;
            }
        } catch { /* non-fatal */ }
    }

    console.warn(`${WARN} yt-dlp could not be installed automatically.`);
    console.warn(`   Install manually: pip3 install yt-dlp  |  pkg install yt-dlp`);
}

// ── ffmpeg ────────────────────────────────────────────────────────────────────
// Too platform-specific to auto-install safely. Check and inform only.

function checkFfmpeg() {
    if (checkBinary('ffmpeg')) {
        console.log(`${OK} ffmpeg found`);
    } else {
        console.warn(`${WARN} ffmpeg not found — sticker, audio, and video conversion will fail.`);
        console.warn(`   Termux: pkg install ffmpeg -y`);
        console.warn(`   VPS:    sudo apt install ffmpeg -y`);
        console.warn(`   Windows: winget install ffmpeg`);
    }
}

// ── Run ───────────────────────────────────────────────────────────────────────

console.log('\n\x1b[36m━━━ Installing system dependencies ━━━\x1b[0m');
try { installYtDlp(); } catch (e) { console.warn(`${WARN} yt-dlp install error:`, e.message); }
try { checkFfmpeg();  } catch (e) { console.warn(`${WARN} ffmpeg check error:`,   e.message); }
console.log('\x1b[36m━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\x1b[0m\n');
