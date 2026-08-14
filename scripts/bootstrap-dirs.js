'use strict';

const fs   = require('fs');
const path = require('path');

const OK   = '\x1b[32m✅\x1b[0m';
const INFO = '\x1b[36mℹ️ \x1b[0m';

const ROOT = path.join(__dirname, '..');

// Map of directory → purpose (for logging)
const DIRS = {
    'VantageXMedia':       'temp media files',
    'VantageXMedia/trash': 'discarded temp files',
    'VantageXMedia/video': 'temp video output',
    'VantageXMedia/gif':   'temp gif output',
    'session':             'WhatsApp session data',
    'media':               'persistent media assets',
    'logs':                'runtime logs',
};

function bootstrapDirs() {
    console.log('\n\x1b[36m━━━ Bootstrapping directories ━━━\x1b[0m');

    let created = 0;
    let skipped = 0;

    for (const [dir, purpose] of Object.entries(DIRS)) {
        const full = path.join(ROOT, dir);
        if (!fs.existsSync(full)) {
            fs.mkdirSync(full, { recursive: true });
            console.log(`${OK} Created ${dir}/ (${purpose})`);
            created++;
        } else {
            skipped++;
        }
    }

    if (created === 0) console.log(`${INFO} All directories already present`);
    console.log('\x1b[36m━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\x1b[0m\n');
}

bootstrapDirs();
