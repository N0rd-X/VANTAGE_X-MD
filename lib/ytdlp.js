'use strict';

/**
 *
 * Shared yt-dlp wrapper for all download commands.
 *
 * yt-dlp must be installed as a system dependency:
 *
 * @param {string} input   - URL or search query (e.g. "never gonna give you up")
 * @param {object} opts
 * @param {'video'|'audio'} opts.type    - What to download
 * @param {'mp4'|'mp3'|'webm'} opts.format - Output format
 * @param {number} [opts.maxSecs]        - Reject if longer than this (seconds)
 * @returns {Promise<{ buffer: Buffer, title: string, duration: string, uploader: string }>}
 */

const { execFile } = require('child_process');
const fs           = require('fs');
const path         = require('path');
const { promisify } = require('util');

const execFileAsync = promisify(execFile);

// How long we'll wait for yt-dlp before giving up (ms)
const YTDLP_TIMEOUT = 90_000;

// Where to put temp files
const TMP_DIR = '/tmp';

// ── Public helper ─────────────────────────────────────────────────────────────

async function ytdlp(input, { type = 'video', format = 'mp4', maxSecs = 600 } = {}) {

    const isUrl = /^https?:\/\//i.test(input);

    // ── Step 1: get metadata to check duration before downloading ────────────
    const metaArgs = [
        '--dump-json',
        '--no-playlist',
        '--quiet',
        isUrl ? input : `ytsearch1:${input}`
    ];

    let meta;
    try {
        const { stdout } = await execFileAsync('yt-dlp', metaArgs, { timeout: 20_000 });
        meta = JSON.parse(stdout.trim().split('\n')[0]); // first result if multiple lines
    } catch (err) {
        // yt-dlp not installed or input completely invalid
        if (err.code === 'ENOENT') {
            throw new Error('yt-dlp is not installed. See INSTALL.md for setup instructions.');
        }
        throw new Error(`unavailable: ${err.stderr || err.message}`);
    }

    if (!meta) throw new Error('No results found.');

    // ── Step 2: duration check ────────────────────────────────────────────────
    const duration = meta.duration || 0;
    if (maxSecs && duration > maxSecs) {
        throw new Error(`too long: ${Math.round(duration / 60)} min (max ${Math.round(maxSecs / 60)} min)`);
    }

    // ── Step 3: build download args ───────────────────────────────────────────
    const tmpFile = path.join(TMP_DIR, `vx_${Date.now()}_${Math.random().toString(36).slice(2,7)}`);
    const outTemplate = `${tmpFile}.%(ext)s`;

    let formatArg;
    if (type === 'audio') {
        // Best audio, converted to mp3
        formatArg = ['--extract-audio', '--audio-format', 'mp3', '--audio-quality', '5'];
    } else {
        // Best video + audio merged into mp4, max 720p to keep file sizes sane
        // Falls back to best available if 720p isn't there
        formatArg = [
            '--format', 'bestvideo[height<=720][ext=mp4]+bestaudio[ext=m4a]/bestvideo[height<=720]+bestaudio/best[height<=720]/best',
            '--merge-output-format', 'mp4'
        ];
    }

    const dlArgs = [
        ...formatArg,
        '--no-playlist',
        '--no-warnings',
        '--quiet',
        '--output', outTemplate,
        '--socket-timeout', '20',
        '--retries', '3',
        isUrl ? meta.webpage_url || input : `ytsearch1:${input}`
    ];

    try {
        await execFileAsync('yt-dlp', dlArgs, { timeout: YTDLP_TIMEOUT });
    } catch (err) {
        throw new Error(`Download failed: ${err.stderr || err.message}`);
    }

    // ── Step 4: find the output file (yt-dlp chooses the extension) ──────────
    const ext      = type === 'audio' ? 'mp3' : 'mp4';
    const outFile  = `${tmpFile}.${ext}`;
    const altFile  = `${tmpFile}.webm`; // fallback if mp4 merge wasn't possible

    const finalFile = fs.existsSync(outFile) ? outFile
                    : fs.existsSync(altFile)  ? altFile
                    : null;

    if (!finalFile) {
        throw new Error('Output file not found after download.');
    }

    // ── Step 5: read into buffer and clean up ─────────────────────────────────
    let buffer;
    try {
        buffer = fs.readFileSync(finalFile);
    } finally {
        // Always clean up, even if readFileSync throws
        [outFile, altFile].forEach(f => { try { fs.unlinkSync(f); } catch {} });
    }

    // ── Step 6: format duration for display ───────────────────────────────────
    const totalSecs  = Math.round(duration);
    const mins       = Math.floor(totalSecs / 60);
    const secs       = totalSecs % 60;
    const durationFmt = `${mins}:${String(secs).padStart(2, '0')}`;

    return {
        buffer,
        title:    meta.title    || 'Unknown',
        duration: durationFmt,
        uploader: meta.uploader || meta.channel || 'Unknown'
    };
}

module.exports = { ytdlp };