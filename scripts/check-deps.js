'use strict';

const { execSync } = require('child_process');

const OK   = '\x1b[32m✅\x1b[0m';
const WARN = '\x1b[33m⚠️ \x1b[0m';
const INFO = '\x1b[36mℹ️ \x1b[0m';

// required: true  → missing dep sets exit code 1
// required: false → missing dep is a warning only
const DEPS = [
    {
        bin:      'ffmpeg',
        required: true,
        affects:  'sticker, tomp3, tovid, togif, audio effects',
        install:  'Termux: pkg install ffmpeg -y  |  VPS: sudo apt install ffmpeg -y  |  Windows: winget install ffmpeg'
    },
    {
        bin:      'yt-dlp',
        required: true,
        affects:  'youtube, song, play, video, tiktok, facebook, x, instagram',
        install:  'Termux: pkg install yt-dlp -y  |  VPS: pip3 install yt-dlp  |  Windows: winget install yt-dlp'
    },
    {
        bin:      'python3',
        required: false,
        affects:  'yt-dlp installation via pip',
        install:  'Termux: pkg install python -y  |  VPS: sudo apt install python3 -y'
    },
];

function checkBinary(bin) {
    // 'where' on Windows, 'which' everywhere else
    const cmd = process.platform === 'win32' ? `where ${bin}` : `which ${bin}`;
    try {
        execSync(cmd, { stdio: 'ignore' });
        return true;
    } catch {
        return false;
    }
}

function getVersion(bin) {
    try {
        return execSync(`${bin} --version`, { stdio: ['ignore','pipe','ignore'] })
            .toString().trim().split('\n')[0].slice(0, 40);
    } catch {
        return null;
    }
}

function run() {
    console.log('\n\x1b[36m━━━ Checking system dependencies ━━━\x1b[0m');

    let missingRequired = 0;

    for (const dep of DEPS) {
        const found   = checkBinary(dep.bin);
        const version = found ? getVersion(dep.bin) : null;

        if (found) {
            console.log(`${OK} ${dep.bin}${version ? ` (${version})` : ''}`);
        } else if (dep.required) {
            missingRequired++;
            console.warn(`${WARN} ${dep.bin} not found — affects: ${dep.affects}`);
            console.warn(`   Install: ${dep.install}`);
        } else {
            console.log(`${INFO} ${dep.bin} not found (optional) — ${dep.affects}`);
        }
    }

    if (missingRequired > 0) {
        console.warn(`\n${WARN} ${missingRequired} required dep(s) missing — some commands will not work.\n`);
        process.exit(1);
    } else {
        console.log('\n\x1b[32mAll required dependencies found.\x1b[0m\n');
    }
}

run();
