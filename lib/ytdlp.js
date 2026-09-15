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

        if (pkg.ytDlpPath && fs.existsSync(pkg.ytDlpPath)) {
            console.log('[ytdlp] yt-dlp-exec v3 binary:', pkg.ytDlpPath);
            return pkg.ytDlpPath;
        }

        const legacyPath = pkg.path || pkg.binaryPath || pkg.raw?.path;
        if (legacyPath && fs.existsSync(legacyPath)) {
            console.log('[ytdlp] yt-dlp-exec legacy binary:', legacyPath);
            return legacyPath;
        }

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

    console.warn('[ytdlp] ⚠️  yt-dlp not found — download commands will fail.');
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
const YT_CLIENTS = [
    ['--extractor-args', 'youtube:player_client=tv_embedded'],
    ['--extractor-args', 'youtube:player_client=mweb'],
    ['--extractor-args', 'youtube:player_client=web_embedded'],
    [],   // bare — no client override, last resort
];

// Optional YouTube session
const YT_COOKIES = process.env.YT_COOKIES_FILE
    && fs.existsSync(process.env.YT_COOKIES_FILE)
    ? process.env.YT_COOKIES_FILE
    : null;

if (YT_COOKIES) console.log('[ytdlp] cookies :', YT_COOKIES);

// ── Check if an error is a bot-detection / auth error worth retrying ──────────
function isBotError(err) {
    const m = (err.stderr || err.message || '').toLowerCase();
    return (
        m.includes('sign in')   ||
        m.includes('bot')       ||
        m.includes('403')       ||
        m.includes('confirm')   ||
        m.includes('429')       ||
        m.includes('player')    ||
        m.includes('premiere')
    );
}

// ── Single attempt with a specific client strategy ────────────────────────────
async function attempt(query, clientArgs, { type, maxSecs }) {
    const baseArgs = ['--no-playlist', '--quiet', '--no-warnings'];
    if (FFMPEG)    baseArgs.push('--ffmpeg-location', FFMPEG);
    if (YT_COOKIES) baseArgs.push('--cookies', YT_COOKIES);
    if (clientArgs.length) baseArgs.push(...clientArgs);

    // ── Step 1: fetch metadata ────────────────────────────────────────────────
    let meta;
    try {
        const metaArgs  = ['--dump-json', ...baseArgs, query];
        const { stdout } = await execFileAsync(YTDLP, metaArgs, { timeout: 30_000 });
        for (const line of stdout.trim().split('\n').filter(Boolean)) {
            try { meta = JSON.parse(line); break; } catch {}
        }
    } catch (err) {
        if (err.code === 'ENOENT') throw new Error('yt-dlp binary not found — see INSTALL.md');
        const m = (err.stderr || err.message || '').toLowerCase();
        if (m.includes('private') || m.includes('members only')) throw new Error('private');
        if (m.includes('not available') || m.includes('unavailable')) throw new Error('unavailable');
        throw err;
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
        ...baseArgs,
        '--output',         `${tmpBase}.%(ext)s`,
        '--socket-timeout', '30',
        '--retries',        '3',
        meta.webpage_url || query,
    );

    try {
        await execFileAsync(YTDLP, dlArgs, { timeout: 180_000 });
    } catch (err) {
        const m = (err.stderr || err.message || '').toLowerCase();
        if (m.includes('private') || m.includes('members only')) throw new Error('private');
        throw err;
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

// ── Public helper ─────────────────────────────────────────────────────────────

/** Download audio or video from any yt-dlp-supported site.
 *  For YouTube, automatically retries with multiple player clients. **/
async function ytdlp(input, { type = 'video', maxSecs = 600 } = {}) {
    const isUrl = /^https?:\/\//i.test(input);
    const isYT  = isUrl && /youtu\.?be|youtube\.com/i.test(input);
    const query = isUrl ? input : `ytsearch1:${input}`;

    // Non-YouTube sites: single attempt, no client args needed
    if (!isYT) {
        return await attempt(query, [], { type, maxSecs });
    }

    // YouTube: walk through client strategies, retry on bot-detection errors only
    const tried = [];
    for (const clientArgs of YT_CLIENTS) {
        const label = clientArgs[1] || 'bare';
        try {
            console.log(`[ytdlp] trying client strategy: ${label}`);
            return await attempt(query, clientArgs, { type, maxSecs });
        } catch (err) {
            // Hard errors — don't retry, surface immediately
            if (
                err.message === 'private'       ||
                err.message === 'unavailable'   ||
                err.message.startsWith('too long') ||
                err.message.startsWith('No results') ||
                err.code === 'ENOENT'
            ) throw err;

            // Bot-detection errors — try the next client
            if (isBotError(err)) {
                console.warn(`[ytdlp] ${label} blocked — trying next strategy`);
                tried.push(`${label}: ${(err.stderr || err.message || '').split('\n')[0]}`);
                continue;
            }

            // Unknown error — surface it
            throw err;
        }
    }

    // All strategies exhausted
    const hint = YT_COOKIES
        ? ''
        : '\n\nTip: Set YT_COOKIES_FILE in your .env to a Netscape-format cookies file from a logged-in YouTube session.';
    throw new Error(`YouTube blocked all client strategies.${hint}\n\nAttempts:\n${tried.join('\n')}`);
}

module.exports = { ytdlp };
