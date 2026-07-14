'use strict';

// Module bootstrap: import libraries, configuration, and helpers
const {
    default: makeWASocket,
    useMultiFileAuthState,
    DisconnectReason,
    fetchLatestBaileysVersion,
    makeCacheableSignalKeyStore,
    jidDecode,
    jidNormalizedUser,
    delay,
} = require('@whiskeysockets/baileys');

const { Boom }  = require('@hapi/boom');
const pino      = require('pino');
const chalk     = require('chalk');
const fs        = require('fs');
const path      = require('path');
const express   = require('express');
const NodeCache = require('node-cache');

const config      = require('./config');
const Vantage_XMenu = require('./menu');

// Handlers & services ──────────────────────────────────────────────────────────
const msgHandler   = require('./handlers/messages');
const groupHandler = require('./handlers/groups');
const callHandler  = require('./handlers/calls');
const autoHandler  = require('./handlers/auto');

// ── Dirs ─────────────────────────────────────────────────────────────────────
const SESSION_DIR = path.join(__dirname, 'session');
const DB_DIR      = path.join(__dirname, 'database');
const MEDIA_DIR   = path.join(__dirname, 'Vantage_XMedia');

for (const d of [SESSION_DIR, DB_DIR, MEDIA_DIR]) {
    if (!fs.existsSync(d)) fs.mkdirSync(d, { recursive: true });
}

// Session bootstrap ───────────────────────────────────────────────────────────
const CREDS_PATH = path.join(SESSION_DIR, 'creds.json');
if (!fs.existsSync(CREDS_PATH) && global.sessionid) {
    try {
        const raw  = global.sessionid.startsWith('VANTAGE_X-MD_')
            ? global.sessionid.slice('VANTAGE_X-MD_'.length)
            : global.sessionid;
        const data = JSON.parse(Buffer.from(raw, 'base64').toString('utf8'));
        fs.writeFileSync(CREDS_PATH, JSON.stringify(data, null, 2));
        console.log(chalk.green('✅ Session restored from SESSION_ID'));
    } catch (e) {
        console.warn(chalk.yellow('⚠️  SESSION_ID present but could not be parsed — scan QR instead'), e.message);
    }
}

// Simple web panel ─────────────────────────────────────────────────────────────────────
const app  = express();
const PORT = process.env.PORT || 3000;
app.use(express.static(path.join(__dirname, 'lib')));
app.get('/', (_req, res) => res.sendFile(path.join(__dirname, 'lib', 'index.html')));
app.get('/health', (_req, res) => res.json({ status: 'ok', bot: config.botname }));
app.listen(PORT, () =>
    console.log(chalk.cyan(`🌐 Web panel: http://localhost:${PORT}`))
);

// Command loader: recursively require command modules and register aliases
function loadCommands() {
    const cmds   = new Map();
    const cmdDir = path.join(__dirname, 'commands');
    if (!fs.existsSync(cmdDir)) return cmds;

    function walk(dir) {
        for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
            const full = path.join(dir, entry.name);
            if (entry.isDirectory()) { walk(full); continue; }
            if (!entry.name.endsWith('.js')) continue;
            try {
                const cmd = require(full);
                if (!cmd.name) continue;
                cmds.set(cmd.name.toLowerCase(), cmd);
                for (const alias of (cmd.aliases || [])) cmds.set(alias.toLowerCase(), cmd);
            } catch (e) {
                console.error(chalk.red(`[CMD LOAD] ${full}: ${e.message}`));
            }
        }
    }

    walk(cmdDir);
    return cmds;
}

// Shared command reference used by handlers
const cmdRef = { commands: loadCommands() };
console.log(chalk.green(`📦 Loaded ${cmdRef.commands.size} command entries`));

fs.watch(path.join(__dirname, 'commands'), { recursive: true }, () => {
    for (const key of Object.keys(require.cache)) {
        if (key.includes(`${path.sep}commands${path.sep}`)) delete require.cache[key];
    }
    cmdRef.commands = loadCommands();
    console.log(chalk.yellow(`🔄 Commands reloaded (${cmdRef.commands.size} entries)`));
});

// ── Main bot function ─────────────────────────────────────────────────────────
let autobioInterval = null;   // stored so it can be cleared on reconnect

async function startBot() {
    const { state, saveCreds } = await useMultiFileAuthState(SESSION_DIR);
    const { version }          = await fetchLatestBaileysVersion();
    const msgRetry             = new NodeCache({ stdTTL: 60 });

    const sock = makeWASocket({
        version,
        logger:                         pino({ level: 'silent' }),
        printQRInTerminal:              true,
        browser:                        ['VANTAGE-X MD', 'Safari', '3.0'],
        auth: {
            creds: state.creds,
            keys:  makeCacheableSignalKeyStore(state.keys, pino({ level: 'silent' })),
        },
        markOnlineOnConnect:            true,
        generateHighQualityLinkPreview: true,
        syncFullHistory:                false,
        msgRetryCounterCache:           msgRetry,
        defaultQueryTimeoutMs:          60_000,
    });

    // Socket helper utilities attached to the socket instance for convenience
    sock.decodeJid = (jid) => {
        if (!jid) return jid;
        if (/:\d+@/gi.test(jid)) {
            const { user, server } = jidDecode(jid) || {};
            return user && server ? `${user}@${server}` : jid;
        }
        return jidNormalizedUser(jid);
    };
    sock.sendText  = (jid, text, quoted, opts = {}) =>
        sock.sendMessage(jid, { text, ...opts }, { quoted, ...opts });
    sock.sendReact = (jid, emoji, key) =>
        sock.sendMessage(jid, { react: { text: emoji, key } });

    sock.ev.on('creds.update', saveCreds);

    // Connection updates
    sock.ev.on('connection.update', async ({ connection, lastDisconnect }) => {
        if (connection === 'open') {
            const menu = new Vantage_XMenu();
            console.log('');
            console.log(chalk.cyan('━'.repeat(50)));
            console.log(chalk.green('  ✅  VANTAGE_X-MD connected'));
            console.log(chalk.white(`  👑  Owner   : ${config.ownername}`));
            console.log(chalk.white(`  🔣  Prefix  : ${config.prefix}`));
            console.log(chalk.white(`  📦  Version : ${menu.version}`));
            console.log(chalk.white(`  🤖  JID     : ${sock.user?.id}`));
            console.log(chalk.cyan('━'.repeat(50)));
            console.log('');

            if (global.autobio) {
                // Keep a single auto-bio interval active; clear previous if present
                if (autobioInterval) clearInterval(autobioInterval);

                const tick = () => {
                    const now = new Date().toLocaleString('en-ZA', { timeZone: 'Africa/Pretoria' });
                    sock.updateProfileStatus(`🔒 VANTAGE-X MD | ${now}`)
                        .catch(err => console.error('[AUTO-BIO]', err.message));
                };
                tick();
                autobioInterval = setInterval(tick, 60_000);
            }
        }

        if (connection === 'close') {
            const code            = new Boom(lastDisconnect?.error)?.output?.statusCode;
            const shouldReconnect = code !== DisconnectReason.loggedOut;
            console.log(chalk.yellow(`⚡ Disconnected (${code}) — ${shouldReconnect ? 'reconnecting…' : 'logged out'}`));
            if (shouldReconnect) {
                await delay(3000);
                return startBot();   // return prevents stack accumulation
            } else {
                console.log(chalk.red('🚫 Logged out. Delete the session folder and restart.'));
                process.exit(0);
            }
        }
    });

    // Attach all handlers
    msgHandler.attach(sock, cmdRef);
    groupHandler.attach(sock);
    callHandler.attach(sock);

    if (global.autolikestatus) autoHandler.attachStatusLike(sock);
    if (global.autoswview)     autoHandler.attachStatusView(sock);

    // Hot-reload self
    const selfPath = require.resolve(__filename);
    fs.watchFile(selfPath, { interval: 2000 }, () => {
        fs.unwatchFile(selfPath);
        console.log(chalk.yellow('🔄 index.js changed — restarting…'));
        delete require.cache[selfPath];
        process.exit(0);
    });

    return sock;
}

// Entry point
startBot().catch(err => {
    console.error(chalk.red('Fatal startup error:'), err);
    process.exit(1);
});

// Unhandled rejection guard
process.on('unhandledRejection', (reason) => {
    const msg    = String(reason);
    const ignore = [
        'Connection Closed', 'Connection Lost', 'ECONNRESET',
        'ETIMEDOUT', 'Socket connection timeout', 'rate-overlimit',
        'Unexpected server response', 'stream errored',
    ];
    if (ignore.some(s => msg.includes(s))) return;
    console.error(chalk.red('[unhandledRejection]'), reason);
});
