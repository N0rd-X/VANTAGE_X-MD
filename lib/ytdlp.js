'use strict';

const { execFile }   = require('child_process');
const { promisify }  = require('util');
const fs             = require('fs');
const path           = require('path');
const os             = require('os');

const execFileAsync = promisify(execFile);
const TMP_DIR       = os.tmpdir();

// ── Locate yt-dlp binary ──────────────────────────────────────────────────────
const YTDLP = (() => {
    try {
        const pkg = require('yt-dlp-exec');

        // v3 API ---------------------------------------------------------------
        if (pkg.ytDlpPath && fs.existsSync(pkg.ytDlpPath)) {
            console.log('[ytdlp] yt-dlp-exec v3 binary:', pkg.ytDlpPath);
            return pkg.ytDlpPath;
        }

        // Legacy v1/v2 API -----------------------------------------------------
        const legacyPath = pkg.path || pkg.binaryPath || pkg.raw?.path;
        if (legacyPath && fs.existsSync(legacyPath)) {
            console.log('[ytdlp] yt-dlp-exec legacy binary:', legacyPath);
            return legacyPath;
        }

        // Resolve from the package's bin/ directory ----------------------------
        const pkgDir  = path.dirname(require.resolve('yt-dlp-exec/package.json'));
        const binName = process.platform === 'win32' ? 'yt-dlp.exe' : 'yt-dlp';
        const binPath = path.join(pkgDir, 'bin', binName);
        if (fs.existsSync(binPath)) {
            console.log('[ytdlp] yt-dlp-exec bin/ binary:', binPath);
            return binPath;
        }
    } catch (e) {
        console.warn('[ytdlp] yt-dlp-exec probe failed:', e.message);
    }

    // Fallback: search well-known system locations ----------------------------
    const candidates = [
        'yt-dlp',
        path.join(os.homedir(), '.local', 'bin', 'yt-dlp'),
        '/usr/local/bin/yt-dlp',
        '/usr/bin/yt-dlp',
    ];
    for (const c of candidates) {
        try {
            require('child_process').execSync(`"${c}" --version`, { stdio: 'ignore', timeout: 5000 });
            console.log('[ytdlp] system yt-dlp found:', c);
            return c;
        } catch {}
    }

    console.warn('[ytdlp] ⚠️  yt-dlp not found — YouTube/download commands will fail. Install yt-dlp.');
    return 'yt-dlp';
})();

// ── Locate ffmpeg ─────────────────────────────────────────────────────────────

const FFMPEG = (() => {
    try {
        const p = require('ffmpeg-static');
        if (p && fs.existsSync(p)) return p;
    } catch {}
    const candidates = ['ffmpeg', '/usr/bin/ffmpeg', '/usr/local/bin/ffmpeg'];
    for (const c of candidates) {
        try {
            require('child_process').execSync(`"${c}" -version`, { stdio: 'ignore', timeout: 5000 });
            return c;
        } catch {}
    }
    return null;
})();

console.log('[ytdlp] yt-dlp :', YTDLP);
console.log('[ytdlp] ffmpeg  :', FFMPEG || 'not found — audio conversion may fail');

// ── YouTube bot-detection bypass ──────────────────────────────────────────────
const YT_EXTRA_ARGS = ['--extractor-args', 'youtube:player_client=ios'];

// ── Public helper ─────────────────────────────────────────────────────────────

/** Download audio or video from YouTube (or any yt-dlp-supported site). **/
async function ytdlp(input, { type = 'video', maxSecs = 600 } = {}) {
    const isUrl = /^https?:\/\//i.test(input);
    const isYT  = isUrl && /youtu\.?be|youtube\.com/i.test(input);
    const query = isUrl ? input : `ytsearch1:${input}`;
    const extraArgs = (!isUrl || isYT) ? YT_EXTRA_ARGS : [];

    // ── Step 1: fetch metadata ────────────────────────────────────────────────
    const metaArgs = [
        '--dump-json', '--no-playlist', '--quiet', '--no-warnings',
        ...extraArgs,
    ];
    if (FFMPEG) metaArgs.push('--ffmpeg-location', FFMPEG);
    metaArgs.push(query);

    let meta;
    try {
        const { stdout } = await execFileAsync(YTDLP, metaArgs, { timeout: 30_000 });
        for (const line of stdout.trim().split('\n').filter(Boolean)) {
            try { meta = JSON.parse(line); break; } catch {}
        }
    } catch (err) {
        if (err.code === 'ENOENT') {
            throw new Error('yt-dlp binary not found — see INSTALL.md');
        }
        const m = (err.stderr || err.message || '').toLowerCase();
        if (m.includes('private') || m.includes('members only'))  throw new Error('private');
        if (m.includes('not available') || m.includes('unavailable')) throw new Error('unavailable');
        if (m.includes('sign in') || m.includes('confirm') || m.includes('bot')) {
            throw new Error('YouTube bot detection triggered — cookies may be required');
        }
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
        ? ['--extract-audio', '--audio-format', 'mp3', '--audio-quality', '0']
        : ['--format', 'bestvideo[height<=720]+bestaudio/best[height<=720]/best', '--merge-output-format', 'mp4'];

    dlArgs.push(
        '--no-playlist', '--quiet', '--no-warnings',
        '--output',         `${tmpBase}.%(ext)s`,
        '--socket-timeout', '30',
        '--retries',        '3',
        ...extraArgs,
    );
    if (FFMPEG) dlArgs.push('--ffmpeg-location', FFMPEG);
    dlArgs.push(meta.webpage_url || query);

    try {
        await execFileAsync(YTDLP, dlArgs, { timeout: 180_000 });
    } catch (err) {
        const m = (err.stderr || err.message || '').toLowerCase();
        if (m.includes('private') || m.includes('members only')) throw new Error('private');
        if (m.includes('sign in') || m.includes('bot')) {
            throw new Error('YouTube bot detection triggered — cookies may be required');
        }
        throw new Error(`Download failed: ${err.stderr || err.message}`);
    }

    // ── Step 4: locate output file ────────────────────────────────────────────
    const allFiles = fs.readdirSync(TMP_DIR)
        .filter(f => f.startsWith(`vx_${tmpId}`))
        .map(f  => path.join(TMP_DIR, f));

    const ext     = type === 'audio' ? 'mp3' : 'mp4';
    const outFile = allFiles.find(f => f.endsWith(ext)) || allFiles[0];

    if (!outFile || !fs.existsSync(outFile)) {
        throw new Error('Output file missing after download.');
    }

    let buffer;
    try   { buffer = fs.readFileSync(outFile); }
    finally { allFiles.forEach(f => { try { fs.unlinkSync(f); } catch {} }); }

    const dur = Math.round(meta.duration || 0);
    return {
        buffer,
        title:    meta.title    || 'Unknown',
        duration: `${Math.floor(dur / 60)}:${String(dur % 60).padStart(2, '0')}`,
        uploader: meta.uploader || meta.channel || 'Unknown',
    };
}

module.exports = { ytdlp };
