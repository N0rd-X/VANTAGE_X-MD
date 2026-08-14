'use strict';

const fs   = require('fs');
const path = require('path');

const OK   = '\x1b[32m✅\x1b[0m';
const WARN = '\x1b[33m⚠️ \x1b[0m';
const INFO = '\x1b[36mℹ️ \x1b[0m';

const DB_DIR = path.join(__dirname, '..', 'database');

// Top-level database files with their default values
const DB_FILES = {
    'anticall.json':        { enabled: false, mode: 'decline' },
    'antilink.json':        {},
    'antispam.json':        {},
    'antinsfw.json':        {},
    'autoreact.json':       { enabled: false, reactions: ['👍','❤️','😂','😮','😢','🙏'] },
    'autotranslate.json':   {},
    'badword.json':         { enabled: false, words: [] },
    'chatbot.json':         { enabled: false },
    'afk-user.json':        {},
    'tempban.json':         {},
    'warnings.json':        {},
    'economy.json':         {},
    'total-hit-user.json':  { count: 0 },
    'owner.json':           [],
    'welcome.json':         {},
    'goodbye.json':         {},
    'settings.json':        {},
};

// Subdirectories with their own default files
const DB_SUBDIRS = {
    'autoreply': {
        files: ['apk','doc','image','sticker','video','vn','zip'],
        default: {}
    }
};

function bootstrapDb() {
    console.log('\n\x1b[36m━━━ Bootstrapping database ━━━\x1b[0m');

    if (!fs.existsSync(DB_DIR)) {
        fs.mkdirSync(DB_DIR, { recursive: true });
        console.log(`${OK} Created database/ directory`);
    }

    // Subdirectories
    for (const [dir, config] of Object.entries(DB_SUBDIRS)) {
        const dirPath = path.join(DB_DIR, dir);
        if (!fs.existsSync(dirPath)) {
            fs.mkdirSync(dirPath, { recursive: true });
            console.log(`${OK} Created database/${dir}/`);
        }
        for (const name of config.files) {
            const fp = path.join(dirPath, `${name}.json`);
            if (!fs.existsSync(fp)) {
                fs.writeFileSync(fp, JSON.stringify(config.default, null, 2));
            }
        }
    }

    // Top-level files
    let created = 0;
    let skipped = 0;
    for (const [file, def] of Object.entries(DB_FILES)) {
        const fp = path.join(DB_DIR, file);
        if (!fs.existsSync(fp)) {
            fs.writeFileSync(fp, JSON.stringify(def, null, 2));
            created++;
        } else {
            skipped++;
        }
    }

    if (created > 0) console.log(`${OK} Created ${created} missing database file(s)`);
    if (skipped > 0) console.log(`${INFO} ${skipped} file(s) already present — not touched`);

    console.log('\x1b[36m━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\x1b[0m\n');
}

bootstrapDb();
