'use strict';

const { execFileSync } = require('child_process');
const path             = require('path');

const WARN = '\x1b[33m⚠️ \x1b[0m';

const STEPS = [
    { script: 'install-deps.js',  label: 'System dependencies' },
    { script: 'bootstrap-db.js',  label: 'Database'            },
    { script: 'bootstrap-dirs.js',label: 'Directories'         },
    { script: 'check-deps.js',    label: 'Dependency check'    },
];

console.log('\n\x1b[36m╔══════════════════════════════════╗\x1b[0m');
console.log(  '\x1b[36m║     VANTAGE-X MD  ·  Setup       ║\x1b[0m');
console.log(  '\x1b[36m╚══════════════════════════════════╝\x1b[0m');

for (const step of STEPS) {
    try {
        execFileSync(process.execPath, [path.join(__dirname, step.script)], {
            stdio: 'inherit'
        });
    } catch (e) {
        // Individual scripts handle their own errors — this catches total crashes only
        console.warn(`${WARN} ${step.label} step encountered an unexpected error: ${e.message}`);
    }
}

console.log('\x1b[32m✅ Setup complete — run npm start to launch your bot.\x1b[0m\n');
