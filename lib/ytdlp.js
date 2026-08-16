'use strict';

const { execFile }   = require('child_process');
const { promisify }  = require('util');
const fs             = require('fs');
const path           = require('path');
const os             = require('os');

const execFileAsync = promisify(execFile);
const TMP_DIR       = os.tmpdir();

// ── Locate binaries ───────────────────────────────────────────────────────────

const YTDLP = (() => {
    try {
        // yt-dlp-exec stores the binary path on its exports
        const pkg = require('yt-dlp-exec');
        const p   = pkg.path || pkg.binaryPath || pkg.raw?.path;
        if (p && fs.existsSync(p)) { console.log('[ytdlp] using yt-dlp-exec binary:', p); return p; }
    } catch {}
    // Fallback: search common locations
    const candidates = [
        'yt-dlp',
        path.join(os.homedir(), '.local', 'bin', 'yt-dlp'),
        '/usr/local/bin/yt-dlp',
        '/usr/bin/yt-dlp',
    ];
    for (const c of candidates) {
        try { require('child_process').execSync(`"${c}" --version`, { stdio: 'ignore', timeout: 5000 }); return c; } catch {}
    }
    return 'yt-dlp';
})();

// ffmpeg-static provides a bundled ffmpeg binary via npm
const FFMPEG = (() => {
    try { const p = require('ffmpeg-static'); if (p && fs.existsSync(p)) return p; } catch {}
    const candidates = ['ffmpeg', '/usr/bin/ffmpeg', '/usr/local/bin/ffmpeg'];
    for (const c of candidates) {
        try { require('child_process').execSync(`"${c}" -version`, { stdio: 'ignore', timeout: 5000 }); return c; } catch {}
    }
    return null;
})();

console.log('[ytdlp] yt-dlp binary:', YTDLP);
console.log('[ytdlp] ffmpeg binary:', FFMPEG || 'not found (audio conversion may fail)');

// ── Public helper ─────────────────────────────────────────────────────────────

async function ytdlp(input, { type = 'video', maxSecs = 600 } = {}) {
    const isUrl = /^https?:\/\//i.test(input);
    const query = isUrl ? input : `ytsearch1:${input}`;

    // ── Step 1: metadata ──────────────────────────────────────────────────────
    const metaArgs = ['--dump-json', '--no-playlist', '--quiet', '--no-warnings', query];
    if (FFMPEG) metaArgs.push('--ffmpeg-location', FFMPEG);

    let meta;
    try {
        const { stdout } = await execFileAsync(YTDLP, metaArgs, { timeout: 30_000 });
        for (const line of stdout.trim().split('\n').filter(Boolean)) {
            try { meta = JSON.parse(line); break; } catch {}
        }
    } catch (err) {
        if (err.code === 'ENOENT') throw new Error('yt-dlp binary not found — ensure yt-dlp-exec is installed');
        const m = (err.stderr || err.message || '').toLowerCase();
        if (m.includes('private') || m.includes('members only')) throw new Error('private');
        if (m.includes('not available') || m.includes('unavailable')) throw new Error('unavailable');
        throw new Error(err.stderr || err.message);
    }

    if (!meta) throw new Error('No results found.');

    // ── Step 2: duration check ────────────────────────────────────────────────
    if (maxSecs && (meta.duration || 0) > maxSecs) {
        const mins = Math.round(meta.duration / 60);
        throw new Error(`too long: ${mins} min (max ${Math.round(maxSecs / 60)} min)`);
    }

    // ── Step 3: download ──────────────────────────────────────────────────────
    const tmpId   = `${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
    const tmpBase = path.join(TMP_DIR, `vx_${tmpId}`);

    const dlArgs = type === 'audio'
        ? ['--extract-audio', '--audio-format', 'mp3', '--audio-quality', '5']
        : ['--format', 'bestvideo[height<=720]+bestaudio/best[height<=720]/best', '--merge-output-format', 'mp4'];

    dlArgs.push(
        '--no-playlist', '--quiet', '--no-warnings',
        '--output', `${tmpBase}.%(ext)s`,
        '--socket-timeout', '30',
        '--retries', '3',
    );
    if (FFMPEG) dlArgs.push('--ffmpeg-location', FFMPEG);
    dlArgs.push(meta.webpage_url || query);

    try {
        await execFileAsync(YTDLP, dlArgs, { timeout: 120_000 });
    } catch (err) {
        const m = (err.stderr || err.message || '').toLowerCase();
        if (m.includes('private') || m.includes('members only')) throw new Error('private');
        throw new Error(`Download failed: ${err.stderr || err.message}`);
    }

    // ── Step 4: locate output file ────────────────────────────────────────────
    const allFiles = fs.readdirSync(TMP_DIR)
        .filter(f => f.startsWith(`vx_${tmpId}`))
        .map(f => path.join(TMP_DIR, f));

    const ext      = type === 'audio' ? 'mp3' : 'mp4';
    const outFile  = allFiles.find(f => f.endsWith(ext)) || allFiles[0];
    if (!outFile || !fs.existsSync(outFile)) throw new Error('Output file missing after download.');

    let buffer;
    try   { buffer = fs.readFileSync(outFile); }
    finally { allFiles.forEach(f => { try { fs.unlinkSync(f); } catch {} }); }

    const dur  = Math.round(meta.duration || 0);
    return {
        buffer,
        title:    meta.title    || 'Unknown',
        duration: `${Math.floor(dur / 60)}:${String(dur % 60).padStart(2, '0')}`,
        uploader: meta.uploader || meta.channel || 'Unknown',
    };
}

module.exports = { ytdlp };

