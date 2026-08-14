'use strict';

const config = require('./config');
const os     = require('os');

// ── Unicode helpers ───────────────────────────────────────────────────────────

const SMALL_CAPS = {
    a:'ᴀ', b:'ʙ', c:'ᴄ', d:'ᴅ', e:'ᴇ', f:'ꜰ', g:'ɢ', h:'ʜ',
    i:'ɪ', j:'ᴊ', k:'ᴋ', l:'ʟ', m:'ᴍ', n:'ɴ', o:'ᴏ', p:'ᴘ',
    q:'ǫ', r:'ʀ', s:'s', t:'ᴛ', u:'ᴜ', v:'ᴠ', w:'ᴡ', x:'x',
    y:'ʏ', z:'ᴢ',
};

const FANCY_DIGITS = ['𝟶','𝟷','𝟸','𝟹','𝟺','𝟻','𝟼','𝟽','𝟾','𝟿'];

// ── Class ─────────────────────────────────────────────────────────────────────

class VantageMenu {

    constructor() {
        this.version = '0.0.0.7';
        this.owner   = config.ownername || 'Nord-X';
        this.prefix  = config.prefix    || '!';
        this.botname = 'Vantage-X MD';
        this.team    = 'Team Vantage';
        this.mode    = (process.env.BOT_MODE || 'public').toLowerCase();
    }

    // ── Styling helpers ───────────────────────────────────────────────────────

    _styled(name) {
        return String(name).toLowerCase().split('').map(c => SMALL_CAPS[c] || c).join('');
    }

    _fancyNum(str) {
        return String(str).split('').map(c => {
            const code = c.charCodeAt(0);
            return code >= 48 && code <= 57 ? FANCY_DIGITS[code - 48] : c;
        }).join('');
    }

    _formatUptime(seconds) {
        const d = Math.floor(seconds / 86400);
        const h = Math.floor((seconds % 86400) / 3600);
        const m = Math.floor((seconds % 3600)  / 60);
        return `${this._fancyNum(d)}ᴅ ${this._fancyNum(h)}ʜ ${this._fancyNum(m)}ᴍ`;
    }

    // ── System stats ──────────────────────────────────────────────────────────

    getSystemStats() {
        const totalMem = Math.floor(os.totalmem() / 1024 / 1024);
        const freeMem  = Math.floor(os.freemem()  / 1024 / 1024);
        const usedMem  = totalMem - freeMem;
        const platform = os.platform();

        return {
            load:     `[ ${this._fancyNum(os.loadavg()[0].toFixed(2))} ]`,
            memory:   `${this._fancyNum(usedMem)}ᴍʙ / ${this._fancyNum(totalMem)}ᴍʙ`,
            uptime:   this._formatUptime(process.uptime()),
            engine:   (() => {
                const map = { x64: 'x𝟼𝟺', arm64: 'ᴀʀᴍ𝟼𝟺', arm: 'ᴀʀᴍ', ia32: 'x𝟹𝟸' };
                return map[os.arch()] || this._fancyNum(os.arch());
            })(),
            platform: platform === 'linux' ? 'ᴠᴘs' : this._fancyNum(platform),
            mode:     this._styled(this.mode),
            owner:    this._styled(this.owner),
        };
    }

    // ── Big menu ──────────────────────────────────────────────────────────────

    getMainMenu(commandCount = 190) {
        const s = this.getSystemStats();

        const header =
            `┏╾━━━━━━━━━━━━━━━━╼⊷\n` +
            `┃ ⬢【 𝗩𝗮𝗻𝘁𝗮𝗴𝗲-𝗫 𝗠𝗗 】\n` +
            `┣╾━━━━━━━━━━━━━━━━╼⊷\n` +
            `┃ 👑 ᴏᴡɴᴇʀ : ${s.owner}\n` +
            `┃ 📟 sʏs-ʟᴏᴀᴅ : ${s.load}\n` +
            `┃ 📊 ᴍᴇᴍᴏʀʏ : ${s.memory}\n` +
            `┃ ⏱️ ᴜᴘᴛɪᴍᴇ : ${s.uptime}\n` +
            `┃ 💿 ᴇɴɢɪɴᴇ : ${s.engine}\n` +
            `┃ ☁️ ᴘʟᴀᴛꜰᴏʀᴍ : ${s.platform}\n` +
            `┃ ⚙️ ᴍᴏᴅᴇ : ${s.mode}\n` +
            `┃ 🔣 ᴘʀᴇꜰɪx : ${this.prefix}\n` +
            `┃ 📜 ᴄᴏᴍᴍᴀɴᴅs : ${commandCount}+\n` +
            `┃ 🏷️ ᴠᴇʀsɪᴏɴ : ${this.version}\n` +
            `┗╾━━━━━━━━━━━━━━━━╼⊷`;

        return [
            header,
            this._bigAIMenu(),
            this._bigSearchMenu(),
            this._bigDownloadMenu(),
            this._bigSecurityMenu(),
            this._bigUtilityMenu(),
            this._bigConverterMenu(),
            this._bigFunMenu(),
            this._bigGroupMenu(),
            this._bigSocialMenu(),
            this._bigOwnerMenu(),
            `> ᴛʏᴘᴇ ${this.prefix}ʜᴇʟᴘ <ᴄᴏᴍᴍᴀɴᴅ> ꜰᴏʀ ᴅᴇᴛᴀɪʟs`,
            `⬢ ᴘʀᴏᴅᴜᴄᴛ ᴏꜰ ᴛᴇᴀᴍ ᴠᴀɴᴛᴀɢᴇ`,
        ].join('\n\n');
    }

    // ── Big-menu block builder ────────────────────────────────────────────────

    _bigBlock(title, sections) {
        let out = `『 ${title} 』\n╭╾━━━━━━━━━━━━━━━━╼⊷\n`;
        sections.forEach((sec, i) => {
            out += `╽ ${sec.icon} [ ${sec.title} ]\n`;
            for (const item of sec.items) {
                out += `╽ ⌬ ${this._styled(item)}\n`;
            }
            if (i < sections.length - 1) out += `┠╾━━━━━━━━╼\n`;
        });
        out += `╰╾━━━━━━━━━━━━━━━━╼⊷`;
        return out;
    }

    // ── Big-menu category blocks ──────────────────────────────────────────────

    _bigAIMenu() {
        return this._bigBlock('🧠 ᴀɪ ᴍᴇɴᴜ', [
            { icon: '⌨️',  title: 'ᴛᴇxᴛ ᴀɪ',          items: ['deepseek','chatgpt','metaai','gemini','perplexity','claude'] },
            { icon: '🎨',  title: 'ɪᴍᴀɢᴇ ᴀɪ',          items: ['imagine','nanobanana','gpt2img','remini','detect'] },
        ]);
    }

    _bigSearchMenu() {
        return this._bigBlock('🔎 sᴇᴀʀᴄʜ ᴍᴇɴᴜ', [
            { icon: '🌍',  title: 'ᴡᴇʙ & ɢᴇɴᴇʀᴀʟ',   items: ['google','wikipedia','weather'] },
            { icon: '📱',  title: 'sᴏᴄɪᴀʟ',            items: ['ytsearch','ttsearch','igsearch','xsearch'] },
            { icon: '📚',  title: 'ʀᴇꜰᴇʀᴇɴᴄᴇ',         items: ['lyrics','dictionary','urbandict','ssweb'] },
            { icon: '🎌',  title: 'ᴀɴɪᴍᴇ & ᴍᴀɴɢᴀ',    items: ['anime','manga','character'] },
            { icon: '🎬',  title: 'ᴍᴇᴅɪᴀ ɪɴꜰᴏ',        items: ['movie','shazam'] },
            { icon: '💻',  title: 'ᴅᴇᴠ & ᴛᴇᴄʜ',        items: ['github','npm'] },
            { icon: '💹',  title: 'ꜰɪɴᴀɴᴄᴇ',           items: ['crypto','stock'] },
        ]);
    }

    _bigDownloadMenu() {
        return this._bigBlock('📥 ᴅᴏᴡɴʟᴏᴀᴅ ᴍᴇɴᴜ', [
            { icon: '🎞️', title: 'ᴍᴇᴅɪᴀ',             items: ['youtube','song','play','video','image'] },
            { icon: '📱',  title: 'sᴏᴄɪᴀʟ',            items: ['tiktok','igstory','facebook','x','threads','pinterest','spotify'] },
            { icon: '☁️', title: 'ꜰɪʟᴇ ʜᴏsᴛs',        items: ['apk','mediafire','gdrive','mega','terabox','gitclone'] },
        ]);
    }

    _bigSecurityMenu() {
        return this._bigBlock('🛡️ sᴇᴄᴜʀɪᴛʏ ᴍᴇɴᴜ', [
            { icon: '🔐',  title: 'ᴘʀɪᴠᴀᴄʏ',           items: ['tempmail','ghostmail','passgen'] },
            { icon: '🌐',  title: 'ɴᴇᴛᴡᴏʀᴋ ɪɴᴛᴇʟ',    items: ['whois','ip'] },
        ]);
    }

    _bigUtilityMenu() {
        return this._bigBlock('🛠️ ᴜᴛɪʟɪᴛʏ', [
            { icon: '🔧',  title: 'ʙᴏᴛ ᴛᴏᴏʟs',         items: ['alive','ping','menu','help','tagall','hidetag','tagadmin','translate','ocr','afk','poll'] },
            { icon: '🌐',  title: 'ᴡᴇʙ ᴛᴏᴏʟs',         items: ['readqr','qrgen','shorten'] },
            { icon: 'ℹ️',  title: 'ɪɴꜰᴏʀᴍᴀᴛɪᴏɴ',      items: ['news','countryinfo','readmore','checkmail'] },
            { icon: '🔢',  title: 'ᴇɴᴄᴏᴅᴇʀs',          items: ['encode','decode','morse'] },
            { icon: '🎭',  title: 'ꜰᴀᴋᴇ ᴄʜᴀᴛ',         items: ['fakereply'] },
        ]);
    }

    _bigConverterMenu() {
        return this._bigBlock('🔄 ᴄᴏɴᴠᴇʀᴛᴇʀ ᴍᴇɴᴜ', [
            { icon: '🖼️', title: 'ᴍᴇᴅɪᴀ ʟᴀʙ',         items: ['sticker','removebg','emix','toimg','write','blur'] },
            { icon: '📄',  title: 'ᴅᴏᴄᴜᴍᴇɴᴛ',          items: ['topdf','totext'] },
            { icon: '🔊',  title: 'ꜰx ᴇɴɢɪɴᴇ',         items: ['tomp3','tovid','togif','bass','raudio','rvideo','slowmo','robotvo','demonvo','nightcore'] },
        ]);
    }

    _bigFunMenu() {
        return this._bigBlock('👑 ꜰᴜɴ ᴍᴇɴᴜ', [
            { icon: '🎮',  title: 'ɢᴀᴍᴇs',             items: ['tictactoe','trivia','math','leaderboard'] },
            { icon: '🎲',  title: 'ᴄʜᴀɴᴄᴇ',            items: ['dice','slot','coinflip','roulette'] },
            { icon: '🧪',  title: 'ᴛᴇsᴛs',             items: ['aura','lovetest','gaytest'] },
            { icon: '🎭',  title: 'ʀᴀɴᴅᴏᴍ',            items: ['quote','roast','rlogo','rpic','rcat','rdog','rmeme','rcos','ranime','rwaifu'] },
            { icon: '🎲',  title: 'ᴛʀᴜᴛʜ & ᴅᴀʀᴇ',     items: ['truth','dare'] },
            { icon: '😂',  title: 'ᴊᴏᴋᴇs',             items: ['joke','pickup','mock'] },
            { icon: '🏦',  title: 'ᴇᴄᴏɴᴏᴍʏ',           items: ['rank','bank','daily','gamble','transfer','rich'] },
        ]);
    }

    _bigGroupMenu() {
        return this._bigBlock('👥 ɢʀᴏᴜᴘ ᴍᴇɴᴜ', [
            { icon: '🛂',  title: 'ᴀᴅᴍɪɴ ᴄᴏʀᴇ',        items: ['promote','demote','mute','unmute','add','kick','help'] },
            { icon: '🛡️', title: 'sᴀꜰᴇɢᴜᴀʀᴅ',         items: ['antilink','antibot','antispam','antiviewonce','antinsfw','antibadword','warn','resetwarn','delete'] },
            { icon: '🔧',  title: 'ɢʀᴏᴜᴘ sᴇᴛᴛɪɴɢs',   items: ['ginfo','welcome','setwelcome','goodbye','setgoodbye','accept','acceptall','reject','rejectall','autosticker'] },
        ]);
    }

    _bigSocialMenu() {
        return this._bigBlock('💞 sᴏᴄɪᴀʟ ᴍᴇɴᴜ', [
            { icon: '💞',  title: 'ɪɴᴛᴇʀᴀᴄᴛ',          items: ['kiss','hug','slap','lick','bite','yeet','bonk','pat','kill','blush','cuddle','wave','poke','highv','spank'] },
        ]);
    }

    _bigOwnerMenu() {
        return this._bigBlock('👑 ᴏᴡɴᴇʀ ᴍᴇɴᴜ', [
            { icon: '⚙️', title: 'sʏsᴛᴇᴍ',             items: ['settings','invite','join','audiviewstatus','autoreact'] },
            { icon: '📡',  title: 'ᴀᴜᴛᴏᴍᴀᴛɪᴏɴ',        items: ['autoreply','autolikestatus','autoread','alwaysonline'] },
            { icon: '👤',  title: 'ʙᴏᴛ ᴘʀᴏꜰɪʟᴇ',       items: ['owner','ownernumber','ownername','antidelpath','setprefix','setdp','setbio','setdesc','setvar'] },
            { icon: '🚫',  title: 'ᴍᴏᴅᴇʀᴀᴛɪᴏɴ',        items: ['setmenuimg','eval','shell','cleanup','broadcast','restart','shutdown','block','unblock'] },
        ]);
    }

    // ── Category router ───────────────────────────────────────────────────────

    getCategoryMenu(category) {
        const map = {
            ai:        () => this.getAIMenu(),
            search:    () => this.getSearchMenu(),
            download:  () => this.getDownloadMenu(),
            security:  () => this.getSecurityMenu(),
            utility:   () => this.getUtilityMenu(),
            converter: () => this.getConverterMenu(),
            fun:       () => this.getFunMenu(),
            group:     () => this.getGroupMenu(),
            social:    () => this.getSocialMenu(),
            owner:     () => this.getOwnerMenu(),
        };
        const fn = map[category.toLowerCase()];
        return fn
            ? fn()
            : `❌ Unknown category: *${category}*\n\nAvailable: ${Object.keys(map).join(', ')}`;
    }

    // ── Category sub-menus ────────────────────────────────────────────────────

    getAIMenu() {
        const p = this.prefix;
        return `『 🧠 ᴀɪ ᴍᴇɴᴜ 』
╭╾━━━━━━━━━━━━━━━━╼⊷
╽ ⌨️ [ ᴛᴇxᴛ ᴀɪ ]
╽ ⌬ ${p}deepseek <prompt>
╽ ⌬ ${p}chatgpt <prompt>
╽ ⌬ ${p}metaai <prompt>
╽ ⌬ ${p}gemini <prompt>
╽ ⌬ ${p}perplexity <prompt>
╽ ⌬ ${p}claude <prompt>
┠╾━━━━━━━━╼
╽ 🎨 [ ɪᴍᴀɢᴇ ᴀɪ ]
╽ ⌬ ${p}imagine <description>
╽ ⌬ ${p}nanobanana <description>
╽ ⌬ ${p}gpt2img <description>
╽ ⌬ ${p}remini (reply image)
╽ ⌬ ${p}detect (reply image)
╰╾━━━━━━━━━━━━━━━━╼⊷`;
    }

    getSearchMenu() {
        const p = this.prefix;
        return `『 🔎 sᴇᴀʀᴄʜ ᴍᴇɴᴜ 』
╭╾━━━━━━━━━━━━━━━━╼⊷
╽ 🌍 [ ᴡᴇʙ & ɢᴇɴᴇʀᴀʟ ]
╽ ⌬ ${p}google <query>
╽ ⌬ ${p}wikipedia <query>
╽ ⌬ ${p}weather <city>
┠╾━━━━━━━━╼
╽ 📱 [ sᴏᴄɪᴀʟ ]
╽ ⌬ ${p}ytsearch <query>
╽ ⌬ ${p}ttsearch <query>
╽ ⌬ ${p}igsearch <username>
╽ ⌬ ${p}xsearch <query>
┠╾━━━━━━━━╼
╽ 📚 [ ʀᴇꜰᴇʀᴇɴᴄᴇ ]
╽ ⌬ ${p}lyrics <song>
╽ ⌬ ${p}dictionary <word>
╽ ⌬ ${p}urbandict <term>
╽ ⌬ ${p}ssweb <url>
┠╾━━━━━━━━╼
╽ 🎌 [ ᴀɴɪᴍᴇ & ᴍᴀɴɢᴀ ]
╽ ⌬ ${p}anime <query>
╽ ⌬ ${p}manga <query>
╽ ⌬ ${p}character <name>
┠╾━━━━━━━━╼
╽ 🎬 [ ᴍᴇᴅɪᴀ ɪɴꜰᴏ ]
╽ ⌬ ${p}movie <title>
╽ ⌬ ${p}shazam (reply audio)
┠╾━━━━━━━━╼
╽ 💻 [ ᴅᴇᴠ & ᴛᴇᴄʜ ]
╽ ⌬ ${p}github <user/repo>
╽ ⌬ ${p}npm <package>
┠╾━━━━━━━━╼
╽ 💹 [ ꜰɪɴᴀɴᴄᴇ ]
╽ ⌬ ${p}crypto <coin>
╽ ⌬ ${p}stock <symbol>
╰╾━━━━━━━━━━━━━━━━╼⊷`;
    }

    getDownloadMenu() {
        const p = this.prefix;
        return `『 📥 ᴅᴏᴡɴʟᴏᴀᴅ ᴍᴇɴᴜ 』
╭╾━━━━━━━━━━━━━━━━╼⊷
╽ 🎞️ [ ᴍᴇᴅɪᴀ ]
╽ ⌬ ${p}youtube <url>
╽ ⌬ ${p}song <title>
╽ ⌬ ${p}play <title>
╽ ⌬ ${p}video <title>
╽ ⌬ ${p}image <query>
┠╾━━━━━━━━╼
╽ 📱 [ sᴏᴄɪᴀʟ ]
╽ ⌬ ${p}tiktok <url>
╽ ⌬ ${p}igstory <username>
╽ ⌬ ${p}facebook <url>
╽ ⌬ ${p}x <url>
╽ ⌬ ${p}threads <url>
╽ ⌬ ${p}pinterest <url>
╽ ⌬ ${p}spotify <url>
┠╾━━━━━━━━╼
╽ ☁️ [ ꜰɪʟᴇ ʜᴏsᴛs ]
╽ ⌬ ${p}apk <app>
╽ ⌬ ${p}mediafire <url>
╽ ⌬ ${p}gdrive <url>
╽ ⌬ ${p}mega <url>
╽ ⌬ ${p}terabox <url>
╽ ⌬ ${p}gitclone <url>
╰╾━━━━━━━━━━━━━━━━╼⊷`;
    }

    getSecurityMenu() {
        const p = this.prefix;
        return `『 🛡️ sᴇᴄᴜʀɪᴛʏ ᴍᴇɴᴜ 』
╭╾━━━━━━━━━━━━━━━━╼⊷
╽ 🔐 [ ᴘʀɪᴠᴀᴄʏ ]
╽ ⌬ ${p}tempmail
╽ ⌬ ${p}ghostmail
╽ ⌬ ${p}passgen <length>
┠╾━━━━━━━━╼
╽ 🌐 [ ɴᴇᴛᴡᴏʀᴋ ɪɴᴛᴇʟ ]
╽ ⌬ ${p}whois <domain>
╽ ⌬ ${p}ip <address>
╰╾━━━━━━━━━━━━━━━━╼⊷`;
    }

    getUtilityMenu() {
        const p = this.prefix;
        return `『 🛠️ ᴜᴛɪʟɪᴛʏ 』
╭╾━━━━━━━━━━━━━━━━╼⊷
╽ 🔧 [ ʙᴏᴛ ᴛᴏᴏʟs ]
╽ ⌬ ${p}alive
╽ ⌬ ${p}ping
╽ ⌬ ${p}menu
╽ ⌬ ${p}help <command>
╽ ⌬ ${p}tagall <message>
╽ ⌬ ${p}hidetag <message>
╽ ⌬ ${p}tagadmin
╽ ⌬ ${p}translate <lang> <text>
╽ ⌬ ${p}ocr (reply image)
╽ ⌬ ${p}afk <reason>
╽ ⌬ ${p}poll <question>
┠╾━━━━━━━━╼
╽ 🌐 [ ᴡᴇʙ ᴛᴏᴏʟs ]
╽ ⌬ ${p}readqr (reply)
╽ ⌬ ${p}qrgen <text>
╽ ⌬ ${p}shorten <url>
┠╾━━━━━━━━╼
╽ ℹ️ [ ɪɴꜰᴏʀᴍᴀᴛɪᴏɴ ]
╽ ⌬ ${p}news
╽ ⌬ ${p}countryinfo <country>
╽ ⌬ ${p}readmore
╽ ⌬ ${p}checkmail <email>
┠╾━━━━━━━━╼
╽ 🔢 [ ᴇɴᴄᴏᴅᴇʀs ]
╽ ⌬ ${p}encode <text>
╽ ⌬ ${p}decode <text>
╽ ⌬ ${p}morse <text>
┠╾━━━━━━━━╼
╽ 🎭 [ ꜰᴀᴋᴇ ᴄʜᴀᴛ ]
╽ ⌬ ${p}fakereply <text>
╰╾━━━━━━━━━━━━━━━━╼⊷`;
    }

    getConverterMenu() {
        const p = this.prefix;
        return `『 🔄 ᴄᴏɴᴠᴇʀᴛᴇʀ ᴍᴇɴᴜ 』
╭╾━━━━━━━━━━━━━━━━╼⊷
╽ 🖼️ [ ᴍᴇᴅɪᴀ ʟᴀʙ ]
╽ ⌬ ${p}sticker (reply)
╽ ⌬ ${p}removebg (reply)
╽ ⌬ ${p}emix (reply)
╽ ⌬ ${p}toimg (reply)
╽ ⌬ ${p}write <text>
╽ ⌬ ${p}blur (reply)
┠╾━━━━━━━━╼
╽ 📄 [ ᴅᴏᴄᴜᴍᴇɴᴛ ]
╽ ⌬ ${p}topdf (reply)
╽ ⌬ ${p}totext (reply)
┠╾━━━━━━━━╼
╽ 🔊 [ ꜰx ᴇɴɢɪɴᴇ ]
╽ ⌬ ${p}tomp3 (reply)
╽ ⌬ ${p}tovid (reply)
╽ ⌬ ${p}togif (reply)
╽ ⌬ ${p}bass (reply)
╽ ⌬ ${p}raudio
╽ ⌬ ${p}rvideo
╽ ⌬ ${p}slowmo (reply)
╽ ⌬ ${p}robotvo (reply)
╽ ⌬ ${p}demonvo (reply)
╽ ⌬ ${p}nightcore (reply)
╰╾━━━━━━━━━━━━━━━━╼⊷`;
    }

    getFunMenu() {
        const p = this.prefix;
        return `『 👑 ꜰᴜɴ ᴍᴇɴᴜ 』
╭╾━━━━━━━━━━━━━━━━╼⊷
╽ 🎮 [ ɢᴀᴍᴇs ]
╽ ⌬ ${p}tictactoe @user
╽ ⌬ ${p}trivia
╽ ⌬ ${p}math
╽ ⌬ ${p}leaderboard
┠╾━━━━━━━━╼
╽ 🎲 [ ᴄʜᴀɴᴄᴇ ]
╽ ⌬ ${p}dice
╽ ⌬ ${p}slot
╽ ⌬ ${p}coinflip
╽ ⌬ ${p}roulette
┠╾━━━━━━━━╼
╽ 🧪 [ ᴛᴇsᴛs ]
╽ ⌬ ${p}aura
╽ ⌬ ${p}lovetest @user
╽ ⌬ ${p}gaytest @user
┠╾━━━━━━━━╼
╽ 🎭 [ ʀᴀɴᴅᴏᴍ ]
╽ ⌬ ${p}quote
╽ ⌬ ${p}roast @user
╽ ⌬ ${p}rlogo
╽ ⌬ ${p}rpic
╽ ⌬ ${p}rcat
╽ ⌬ ${p}rdog
╽ ⌬ ${p}rmeme
╽ ⌬ ${p}rcos
╽ ⌬ ${p}ranime
╽ ⌬ ${p}rwaifu
┠╾━━━━━━━━╼
╽ 🎲 [ ᴛʀᴜᴛʜ & ᴅᴀʀᴇ ]
╽ ⌬ ${p}truth
╽ ⌬ ${p}dare
┠╾━━━━━━━━╼
╽ 😂 [ ᴊᴏᴋᴇs ]
╽ ⌬ ${p}joke
╽ ⌬ ${p}pickup
╽ ⌬ ${p}mock
┠╾━━━━━━━━╼
╽ 🏦 [ ᴇᴄᴏɴᴏᴍʏ ]
╽ ⌬ ${p}rank
╽ ⌬ ${p}bank
╽ ⌬ ${p}daily
╽ ⌬ ${p}gamble <amount>
╽ ⌬ ${p}transfer @user <amount>
╽ ⌬ ${p}rich
╰╾━━━━━━━━━━━━━━━━╼⊷`;
    }

    getGroupMenu() {
        const p = this.prefix;
        return `『 👥 ɢʀᴏᴜᴘ ᴍᴇɴᴜ 』
╭╾━━━━━━━━━━━━━━━━╼⊷
╽ 🛂 [ ᴀᴅᴍɪɴ ᴄᴏʀᴇ ]
╽ ⌬ ${p}promote @user
╽ ⌬ ${p}demote @user
╽ ⌬ ${p}mute
╽ ⌬ ${p}unmute
╽ ⌬ ${p}add <number>
╽ ⌬ ${p}kick @user
╽ ⌬ ${p}help <command>
┠╾━━━━━━━━╼
╽ 🛡️ [ sᴀꜰᴇɢᴜᴀʀᴅ ]
╽ ⌬ ${p}antilink on/off
╽ ⌬ ${p}antibot on/off
╽ ⌬ ${p}antispam on/off
╽ ⌬ ${p}antiviewonce on/off
╽ ⌬ ${p}antinsfw on/off
╽ ⌬ ${p}antibadword on/off
╽ ⌬ ${p}warn @user
╽ ⌬ ${p}resetwarn @user
╽ ⌬ ${p}delete (reply)
┠╾━━━━━━━━╼
╽ 🔧 [ ɢʀᴏᴜᴘ sᴇᴛᴛɪɴɢs ]
╽ ⌬ ${p}ginfo
╽ ⌬ ${p}welcome on/off
╽ ⌬ ${p}setwelcome <text>
╽ ⌬ ${p}goodbye on/off
╽ ⌬ ${p}setgoodbye <text>
╽ ⌬ ${p}accept
╽ ⌬ ${p}acceptall
╽ ⌬ ${p}reject
╽ ⌬ ${p}rejectall
╽ ⌬ ${p}autosticker on/off
╰╾━━━━━━━━━━━━━━━━╼⊷`;
    }

    getSocialMenu() {
        const p = this.prefix;
        return `『 💞 sᴏᴄɪᴀʟ ᴍᴇɴᴜ 』
╭╾━━━━━━━━━━━━━━━━╼⊷
╽ 💞 [ ɪɴᴛᴇʀᴀᴄᴛ ]
╽ ⌬ ${p}kiss @user
╽ ⌬ ${p}hug @user
╽ ⌬ ${p}slap @user
╽ ⌬ ${p}lick @user
╽ ⌬ ${p}bite @user
╽ ⌬ ${p}yeet @user
╽ ⌬ ${p}bonk @user
╽ ⌬ ${p}pat @user
╽ ⌬ ${p}kill @user
╽ ⌬ ${p}blush
╽ ⌬ ${p}cuddle @user
╽ ⌬ ${p}wave
╽ ⌬ ${p}poke @user
╽ ⌬ ${p}highv @user
╽ ⌬ ${p}spank @user
╰╾━━━━━━━━━━━━━━━━╼⊷`;
    }

    getOwnerMenu() {
        const p = this.prefix;
        return `『 👑 ᴏᴡɴᴇʀ ᴍᴇɴᴜ 』
╭╾━━━━━━━━━━━━━━━━╼⊷
╽ ⚙️ [ sʏsᴛᴇᴍ ]
╽ ⌬ ${p}settings
╽ ⌬ ${p}invite
╽ ⌬ ${p}join <link>
╽ ⌬ ${p}audiviewstatus on/off
╽ ⌬ ${p}autoreact on/off
┠╾━━━━━━━━╼
╽ 📡 [ ᴀᴜᴛᴏᴍᴀᴛɪᴏɴ ]
╽ ⌬ ${p}autoreply on/off
╽ ⌬ ${p}autolikestatus on/off
╽ ⌬ ${p}autoread on/off
╽ ⌬ ${p}alwaysonline on/off
┠╾━━━━━━━━╼
╽ 👤 [ ʙᴏᴛ ᴘʀᴏꜰɪʟᴇ ]
╽ ⌬ ${p}owner
╽ ⌬ ${p}ownernumber <number>
╽ ⌬ ${p}ownername <name>
╽ ⌬ ${p}antidelpath on/off
╽ ⌬ ${p}setprefix <prefix>
╽ ⌬ ${p}setdp (reply)
╽ ⌬ ${p}setbio <text>
╽ ⌬ ${p}setdesc <text>
╽ ⌬ ${p}setvar <key=value>
┠╾━━━━━━━━╼
╽ 🚫 [ ᴍᴏᴅᴇʀᴀᴛɪᴏɴ ]
╽ ⌬ ${p}setmenuimg (reply)
╽ ⌬ ${p}eval <code>
╽ ⌬ ${p}shell <command>
╽ ⌬ ${p}cleanup
╽ ⌬ ${p}broadcast <message>
╽ ⌬ ${p}restart
╽ ⌬ ${p}shutdown
╽ ⌬ ${p}block @user
╽ ⌬ ${p}unblock @user
╰╾━━━━━━━━━━━━━━━━╼⊷`;
    }

    // ── Alive card ────────────────────────────────────────────────────────────

    getAliveMessage() {
        const s = this.getSystemStats();
        return `╭━━━━❰ 𝗩𝗮𝗻𝘁𝗮𝗴𝗲-𝗫 𝗠𝗗 ❱━━━━╮
┃ ⚡ *ʙᴏᴛ ɪs ᴀʟɪᴠᴇ*
┃
┃ 👑 *ᴏᴡɴᴇʀ:*    ${s.owner}
┃ 👥 *ᴛᴇᴀᴍ:*     ${this._styled(this.team)}
┃ 📊 *ᴍᴇᴍᴏʀʏ:*  ${s.memory}
┃ ⏱️ *ᴜᴘᴛɪᴍᴇ:*  ${s.uptime}
┃ 🔣 *ᴘʀᴇꜰɪx:*   ${this.prefix}
┃ 🏷️ *ᴠᴇʀsɪᴏɴ:* ${this.version}
╰━━━━━━━━━━━━━━━━━━━━╯

> ᴛʏᴘᴇ ${this.prefix}ᴍᴇɴᴜ ꜰᴏʀ ᴄᴏᴍᴍᴀɴᴅs`;
    }

}

module.exports = VantageMenu;
