'use strict';

// ── Small-caps ────────────────────────────────────────────────────────────────

const SMALL_CAPS = {
    a:'ᴀ', b:'ʙ', c:'ᴄ', d:'ᴅ', e:'ᴇ', f:'ꜰ', g:'ɢ', h:'ʜ',
    i:'ɪ', j:'ᴊ', k:'ᴋ', l:'ʟ', m:'ᴍ', n:'ɴ', o:'ᴏ', p:'ᴘ',
    q:'ǫ', r:'ʀ', s:'s', t:'ᴛ', u:'ᴜ', v:'ᴠ', w:'ᴡ', x:'x',
    y:'ʏ', z:'ᴢ',
};

/** Convert a string to small-caps unicode, leaving non-alpha chars unchanged. */
const sc = (str) =>
    String(str).toLowerCase().split('').map(c => SMALL_CAPS[c] || c).join('');

// ── Fancy digits ──────────────────────────────────────────────────────────────

const FANCY_DIGITS = {
    bold:        [...'𝟬𝟭𝟮𝟯𝟰𝟱𝟲𝟳𝟴𝟵'],
    doubleStruck:[...'𝟘𝟙𝟚𝟛𝟜𝟝𝟞𝟟𝟠𝟡'],
    monospace:   [...'𝟶𝟷𝟸𝟹𝟺𝟻𝟼𝟽𝟾𝟿'],
    circled:     [...'⓪①②③④⑤⑥⑦⑧⑨'],
    filledCircle:[...'⓿❶❷❸❹❺❻❼❽❾'],
    fullWidth:   [...'０１２３４５６７８９'],
    subscript:   [...'₀₁₂₃₄₅₆₇₈₉'],
    superscript: [...'⁰¹²³⁴⁵⁶⁷⁸⁹'],
};

/**
 * Replace all digit characters in a string with the chosen fancy style.
 * Defaults to 'bold'. Non-digit characters are left unchanged.
 *
 * @param {string|number} str
 * @param {keyof FANCY_DIGITS} [style='bold']
 *
 * @example
 * fd(42)               // '𝟰𝟮'
 * fd(42, 'monospace')  // '𝟺𝟸'
 * fd(42, 'circled')    // '④②'
 */
const fd = (str, style = 'bold') => {
    const map = FANCY_DIGITS[style];
    if (!map) throw new Error(`[messageStyle] Unknown digit style: "${style}"`);
    return String(str).replace(/[0-9]/g, d => map[+d]);
};

// ── Box-drawing ───────────────────────────────────────────────────────────────

/** The shared bar segment — used by both card borders and menu headers. */
const BAR = '╾━━━━━━━━━━━━━━━━╼';

/** Card borders — ╭ / ┠ / ╰ / ╽ style for all command output cards. */
const TOP = `╭${BAR}⊷`;
const MID = `┠${BAR}`;
const BOT = `╰${BAR}⊷`;
const R   = '╽';

/**
 * Build a styled card string.
 *
 * Each argument after `title` is a **section** — an array of line strings.
 * Sections are separated by MID dividers. An empty string `''` inside a
 * section renders as a blank `╽` row (useful for visual breathing room).
 *
 * @param {string}    title      The header line (after the TOP border)
 * @param {...Array}  sections   One or more arrays of content lines
 *
 * @example <caption>Single section</caption>
 * card('🏓【 ᴘᴏɴɢ 】', ['⚡ Latency: 42ms', '📶 Signal: ▓▓▓▓▓'])
 *
 * @example <caption>Multi-section (extra MID dividers between sections)</caption>
 * card(
 *   `⌬【 ${sc('command help')} 】`,
 *   [`🧩 ${sc('name')}: ping`, `📂 ${sc('category')}: system`],
 *   [`📝 ${sc('description')}`, `└─ ${sc('check bot response time')}`],
 * )
 */
const card = (title, ...sections) => {
    const lines = [TOP, `${R} ${title}`];
    for (const section of sections) {
        lines.push(MID);
        for (const line of section) {
            lines.push(line === '' ? R : `${R} ${line}`);
        }
    }
    lines.push(BOT);
    return lines.join('\n');
};

// ── Exports ───────────────────────────────────────────────────────────────────

module.exports = { sc, SMALL_CAPS, fd, FANCY_DIGITS, BAR, TOP, MID, BOT, R, card };
