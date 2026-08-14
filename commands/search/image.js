'use strict';

/**
 * commands/download/download/image.js
 *
 * Searches for images using the DuckDuckGo image search API
 * (no key required, returns real image results).
 *
 * Falls back to a secondary Unsplash search if DDG returns nothing.
 */

const config = require('../../config');
const axios  = require('axios');
const { send } = require('../../helpers');

module.exports = {
    name: 'image',
    aliases: ['img', 'photo', 'imagesearch'],
    category: 'download',
    description: 'Search and download an image',
    weight: 'heavy',
    usage: `${config.prefix}image <query>`,

    async execute(sock, msg, args) {
        const jid = msg.key.remoteJid;
        try {
            if (!args[0]) {
                return send(sock, jid,
                    `❌ Usage: ${this.usage}\n\nExample: ${config.prefix}image mountain sunset`
                );
            }

            const query = args.join(' ').trim();
            const wait  = await sock.sendMessage(jid, { text: `🔍 Searching images for *${query}*…` });

            // ── DuckDuckGo image search ──────────────────────────────────
            // DDG provides a vqd token then returns results from their CDN.
            // This is the same approach most open-source bots use — no key needed.

            let imageUrl = null;

            try {
                // Step 1: get the vqd token
                const tokenRes = await axios.get('https://duckduckgo.com/', {
                    params:  { q: query, iax: 'images', ia: 'images' },
                    headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' },
                    timeout: 10_000
                });

                const vqdMatch = tokenRes.data.match(/vqd=['"]?([^'"&]+)['"]?/);
                if (!vqdMatch) throw new Error('vqd token not found');
                const vqd = vqdMatch[1];

                // Step 2: fetch image results
                const searchRes = await axios.get('https://duckduckgo.com/i.js', {
                    params: {
                        l: 'us-en', o: 'json', q: query, vqd,
                        f: ',,,,,', p: '1'
                    },
                    headers: {
                        'User-Agent':  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                        'Referer':     'https://duckduckgo.com/',
                        'Accept':      'application/json'
                    },
                    timeout: 10_000
                });

                const results = searchRes.data?.results;
                if (results?.length) {
                    // Pick a random result from the top 5 for variety
                    const pick = results[Math.floor(Math.random() * Math.min(5, results.length))];
                    imageUrl   = pick.image;
                }
            } catch (ddgErr) {
                console.warn('[image] DDG failed:', ddgErr.message, '— trying Unsplash fallback');
            }

            // ── Unsplash fallback ────────────────────────────────────────
            // Unsplash Source redirects to a real photo — reliable but no variety control
            if (!imageUrl) {
                imageUrl = `https://source.unsplash.com/1280x720/?${encodeURIComponent(query)}&sig=${Date.now()}`;
            }

            // ── Verify the URL is reachable before sending ────────────────
            try {
                const check = await axios.head(imageUrl, { timeout: 8_000 });
                const ct    = check.headers['content-type'] || '';
                if (!ct.startsWith('image/')) throw new Error('Not an image');
            } catch {
                return await sock.sendMessage(jid, {
                    text: `❌ Could not fetch an image for *${query}*. Try a different query.`,
                    edit: wait.key
                });
            }

            await sock.sendMessage(jid, { delete: wait.key });

            await sock.sendMessage(jid, {
                image:   { url: imageUrl },
                caption: `🖼️ *${query}*\n> Image search by VANTAGE-X MD`
            }, { quoted: msg });

        } catch (err) {
            console.error('[image]', err.message);
            await send(sock, jid, global.mess.error);
        }
    }
};
