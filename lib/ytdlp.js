'use strict';

const { execFile }  = require('child_process');
const { promisify } = require('util');
const fs            = require('fs');
const path          = require('path');

const execFileAsync = promisify(execFile);
const YTDLP_TIMEOUT = 120_000;
const TMP_DIR       = '/tmp';

// ── Public helper ─────────────────────────────────────────────────────────────

async function ytdlp(input, { type = 'video', format = 'mp4', maxSecs = 600 } = {}) {
    const isUrl = /^https?:\/\//i.test(input);

    // ── Step 1: metadata ──────────────────────────────────────────────────────
    const metaArgs = [
        '--dump-json', '--no-playlist',
        '--quiet', '--no-warnings',
        isUrl ? input : `ytsearch1:${input}`
    ];

    let meta;
    try {
        const { stdout } = await execFileAsync('yt-dlp', metaArgs, { timeout: 25_000 });
        const lines = stdout.trim().split('\n').filter(Boolean);
        for (const line of lines) {
            try { meta = JSON.parse(line); break; } catch { continue; }
        }
    } catch (err) {
        if (err.code === 'ENOENT') {
            throw new Error('yt-dlp is not installed. See INSTALL.md for setup instructions.');
        }
        const msg = (err.stderr || err.message || '').toLowerCase();
        if (msg.includes('private') || msg.includes('members only')) throw new Error('private');
        if (msg.includes('not available') || msg.includes('unavailable')) throw new Error('unavailable');
        throw new Error(err.stderr || err.message);
    }

    if (!meta) throw new Error('No results found for that query.');

    // ── Step 2: duration check ────────────────────────────────────────────────
    const duration = meta.duration || 0;
    if (maxSecs && duration > maxSecs) {
        throw new Error(`too long: ${Math.round(duration / 60)} min (max ${Math.round(maxSecs / 60)} min)`);
    }

    // ── Step 3: download ──────────────────────────────────────────────────────
    const tmpId   = `${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
    const tmpBase = path.join(TMP_DIR, `vx_${tmpId}`);

    let formatArgs;
    if (type === 'audio') {
        formatArgs = [
            '--extract-audio',
            '--audio-format', 'mp3',
            '--audio-quality', '5',
        ];
    } else {
        // Permissive — works on YouTube, TikTok, Instagram, X, Facebook.
        // Does not constrain container or codec so yt-dlp always finds a match.
        formatArgs = [
            '--format',
            'bestvideo[height<=720]+bestaudio/best[height<=720]/bestvideo+bestaudio/best',
            '--merge-output-format', 'mp4',
        ];
    }

    const dlArgs = [
        ...formatArgs,
        '--no-playlist', '--no-warnings', '--quiet',
        '--output', `${tmpBase}.%(ext)s`,
        '--socket-timeout', '30',
        '--retries', '3',
        '--fragment-retries', '3',
        meta.webpage_url || (isUrl ? input : `ytsearch1:${input}`)
    ];

    try {
        await execFileAsync('yt-dlp', dlArgs, { timeout: YTDLP_TIMEOUT });
    } catch (err) {
        const msg = (err.stderr || err.message || '').toLowerCase();
        if (msg.includes('private') || msg.includes('members only')) throw new Error('private');
        throw new Error(`Download failed: ${err.stderr || err.message}`);
    }

    // ── Step 4: locate output file ────────────────────────────────────────────
    // Scan /tmp for any file matching our temp ID — yt-dlp chooses the extension
    const allFiles = fs.readdirSync(TMP_DIR)
        .filter(f => f.startsWith(`vx_${tmpId}`))
        .map(f => path.join(TMP_DIR, f));

    const ext      = type === 'audio' ? 'mp3' : 'mp4';
    const finalFile = allFiles.find(f => f.endsWith(ext))
        || allFiles.find(f => f.endsWith('.webm'))
        || allFiles[0];

    if (!finalFile || !fs.existsSync(finalFile)) {
        throw new Error('Output file not found after download.');
    }

    // ── Step 5: read and clean up ─────────────────────────────────────────────
    let buffer;
    try {
        buffer = fs.readFileSync(finalFile);
    } finally {
        allFiles.forEach(f => { try { fs.unlinkSync(f); } catch {} });
    }

    const totalSecs   = Math.round(duration);
    const mins        = Math.floor(totalSecs / 60);
    const secs        = totalSecs % 60;

    return {
        buffer,
        title:    meta.title    || 'Unknown',
        duration: `${mins}:${String(secs).padStart(2, '0')}`,
        uploader: meta.uploader || meta.channel || 'Unknown'
    };
}

module.exports = { ytdlp };

