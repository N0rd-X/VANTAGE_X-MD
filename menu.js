'use strict';

const config = require('./config');
const os     = require('os');

class VantageMenu {

  constructor() {
    this.version = '0';
    this.owner   = config.ownername || 'Nord-X';
    this.prefix  = config.prefix    || '!';
    this.botname = config.botname   || 'VANTAGE-X MD';
    this.team    = 'Team Vantage';
  }

  // ── Helpers ──────────────────────────────────────────

  getSystemStats() {
    const totalMem = Math.floor(os.totalmem()  / 1024 / 1024);
    const freeMem  = Math.floor(os.freemem()   / 1024 / 1024);
    const usedMem  = totalMem - freeMem;
    const platform = os.platform();
    return {
      load:     os.loadavg()[0].toFixed(2),
      memory:   `${usedMem}ᴍʙ / ${totalMem}ᴍʙ`,
      uptime:   this._formatUptime(process.uptime()),
      engine:   os.arch(),
      platform: platform === 'linux' ? 'ᴠᴘs' : platform,
    };
  }

  _formatUptime(seconds) {
    const d = Math.floor(seconds / 86400);
    const h = Math.floor((seconds % 86400) / 3600);
    const m = Math.floor((seconds % 3600)  / 60);
    return `${d}ᴅ ${h}ʜ ${m}ᴍ`;
  }

  // ── Main menu ────────────────────────────────────────

  getMainMenu(commandCount = 120) {
    const s = this.getSystemStats();
    const p = this.prefix;

    return `╔══════════════════════════╗
║  🔒 ${this.botname} v${this.version}          ║
║  A smart WhatsApp bot    ║
╠══════════════════════════╣
║ 👑 Owner  : ${this.owner.padEnd(14, ' ')}║
║ 🔣 Prefix : ${p.padEnd(14, ' ')}║
║ 📜 Cmds   : ${String(commandCount + '+').padEnd(14, ' ')}║
║ ⏱️ Uptime : ${s.uptime.padEnd(14, ' ')}║
║ 📊 Memory : ${s.memory.padEnd(14, ' ')}║
╚══════════════════════════╝

📂 *Categories* — type ${p}menu <name>

  🧠 ai        🛡️ security
  🔍 search    📥 download
  👥 group     🎮 fun
  🎭 social    🔄 converter
  🛠️ utility   👑 owner

╭━━━━━━━━━━━━━━━━━━━━━━━━╮
┃ 📱 ꜱᴜᴘᴘᴏʀᴛ & ʟɪɴᴋꜱ
┃ ┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈
┃ 💬 ${config.whatsappgroup}
┃ 📢 ${config.whatsappchannel}
┃ ✈️  ${config.telegram}
┃ 🎮 ${config.discord}
╰━━━━━━━━━━━━━━━━━━━━━━━━╯

╿⠀👑 ᴏᴡɴᴇʀ    : ${this.owner}
╿⠀📟 ꜱʏꜱ-ʟᴏᴀᴅ : ${s.load}
╿⠀📊 ᴍᴇᴍᴏʀʏ  : ${s.memory}
╿⠀⏱️ ᴜᴘᴛɪᴍᴇ  : ${s.uptime}
╿⠀💿 ᴇɴɢɪɴᴇ  : ${s.engine}
╿⠀☁️ ᴘʟᴀᴛꜰᴏʀᴍ : ${s.platform}
╿⠀🔣 ᴘʀᴇꜰɪx  : ${p}
╿⠀📜 ᴄᴍᴅꜱ    : ${commandCount}+

━━━⟨ ${this.team} · ${this.owner} ⟩━━━
         ᴘᴏᴡᴇʀᴇᴅ ʙʏ 𝗩𝗮𝗻𝘁𝗮𝗴𝗲-𝗫 𝗠𝗗${this.version}`;
  }

  // ── Category router ──────────────────────────────────

  getCategoryMenu(category) {
    const map = {
      ai:        () => this.getAIMenu(),
      security:  () => this.getSecurityMenu(),
      search:    () => this.getSearchMenu(),
      download:  () => this.getDownloadMenu(),
      fun:       () => this.getFunMenu(),
      group:     () => this.getGroupMenu(),
      social:    () => this.getSocialMenu(),
      converter: () => this.getConverterMenu(),
      utility:   () => this.getUtilityMenu(),
      owner:     () => this.getOwnerMenu(),
    };
    const fn = map[category.toLowerCase()];
    return fn ? fn() : `❌ Unknown category *${category}*.\n\nAvailable: ${Object.keys(map).join(', ')}`;
  }

  // ── Category menus ───────────────────────────────────

  getAIMenu() {
    const p = this.prefix;
    return `『 🧠 ᴀɪ ᴍᴇɴᴜ 』
╭╾━━━━━━━━━━━━━━━╼⊷
╽ ⌨️ [ ᴛᴇxᴛ ᴍᴏᴅᴇʟꜱ ]
╽ ⌬ ${p}deepseek <prompt>
╽ ⌬ ${p}chatgpt <prompt>
╽ ⌬ ${p}metaai <prompt>
╽ ⌬ ${p}gemini <prompt>
╽ ⌬ ${p}perplexity <prompt>
╽ ⌬ ${p}claude <prompt>
┠╾━━━━━━━╼
╽ 🎨 [ ɪᴍᴀɢᴇ ɢᴇɴ ]
╽ ⌬ ${p}imagine <description>
╽ ⌬ ${p}dalle <description>
╽ ⌬ ${p}bingai <description>
┠╾━━━━━━━╼
╽ 🎙️ [ ᴀᴜᴅɪᴏ & ᴠɪꜱɪᴏɴ ]
╽ ⌬ ${p}voice <text>
╽ ⌬ ${p}remini (reply image)
╽ ⌬ ${p}detect (reply image)
╰╾━━━━━━━━━━━━━━━╼⊷`;
  }

  getSecurityMenu() {
    const p = this.prefix;
    return `『 🛡️ ꜱᴇᴄᴜʀɪᴛʏ ᴍᴇɴᴜ 』
╭╾━━━━━━━━━━━━━━━╼⊷
╽ 🔐 [ ᴘʀɪᴠᴀᴄʏ ]
╽ ⌬ ${p}tempmail
╽ ⌬ ${p}ghostmail
╽ ⌬ ${p}passgen <length>
╽ 🌐 [ ɴᴇᴛ-ɪɴᴛᴇʟ ]
╽ ⌬ ${p}whois <domain>
╽ ⌬ ${p}ip <address>
╰╾━━━━━━━━━━━━━━━╼⊷`;
  }

  getSearchMenu() {
    const p = this.prefix;
    return `『 🔍 ꜱᴇᴀʀᴄʜ ᴍᴇɴᴜ 』
╭╾━━━━━━━━━━━━━━━╼⊷
╽ 🌍 [ ɢʟᴏʙᴀʟ ]
╽ ⌬ ${p}google <query>
╽ ⌬ ${p}wikipedia <query>
╽ ⌬ ${p}weather <city>
╽ ⌬ ${p}shazam (reply audio)
┠╾━━━━━━━╼
╽ 📱 [ ꜱᴏᴄɪᴀʟ ]
╽ ⌬ ${p}ytsearch <query>
╽ ⌬ ${p}ttsearch <query>
╽ ⌬ ${p}igsearch <username>
╽ ⌬ ${p}xsearch <query>
┠╾━━━━━━━╼
╽ 📚 [ ʀᴇꜰᴇʀᴇɴᴄᴇ ]
╽ ⌬ ${p}lyrics <song>
╽ ⌬ ${p}dictionary <word>
╽ ⌬ ${p}urbandict <term>
╽ ⌬ ${p}ssweb <url>
╰╾━━━━━━━━━━━━━━━╼⊷`;
  }

  getDownloadMenu() {
    const p = this.prefix;
    return `『 📥 ᴅᴏᴡɴʟᴏᴀᴅ ᴍᴇɴᴜ 』
╭╾━━━━━━━━━━━━━━━╼⊷
╽ 🎞️ [ ᴍᴇᴅɪᴀ ]
╽ ⌬ ${p}youtube <url>
╽ ⌬ ${p}song <title>
╽ ⌬ ${p}play <title>
╽ ⌬ ${p}video <title>
╽ ⌬ ${p}image <query>
┠╾━━━━━━━╼
╽ 📱 [ ꜱᴏᴄɪᴀʟ ]
╽ ⌬ ${p}tiktok <url>
╽ ⌬ ${p}igstory <username>
╽ ⌬ ${p}facebook <url>
╽ ⌬ ${p}x <url>
╽ ⌬ ${p}threads <url>
╽ ⌬ ${p}pinterest <url>
╽ ⌬ ${p}spotify <url>
┠╾━━━━━━━╼
╽ ☁️ [ ꜰɪʟᴇ-ʜᴏꜱᴛꜱ ]
╽ ⌬ ${p}apk <name>
╽ ⌬ ${p}mediafire <url>
╽ ⌬ ${p}gdrive <url>
╽ ⌬ ${p}mega <url>
╽ ⌬ ${p}terabox <url>
╽ ⌬ ${p}gitclone <url>
╰╾━━━━━━━━━━━━━━━╼⊷`;
  }

  getFunMenu() {
    const p = this.prefix;
    return `『 🎮 ꜰᴜɴ ᴍᴇɴᴜ 』
╭╾━━━━━━━━━━━━━━━╼⊷
╽ 🎮 [ ɢᴀᴍᴇꜱ ]
╽ ⌬ ${p}tictactoe @user
╽ ⌬ ${p}trivia
╽ ⌬ ${p}math
╽ ⌬ ${p}leaderboard
┠╾━━━━━━━╼
╽ 🎲 [ ᴄʜᴀɴᴄᴇ ]
╽ ⌬ ${p}dice
╽ ⌬ ${p}slot
╽ ⌬ ${p}coinflip
╽ ⌬ ${p}roulette
┠╾━━━━━━━╼
╽ 🧪 [ ᴛᴇꜱᴛ ]
╽ ⌬ ${p}aura
╽ ⌬ ${p}lovetest @user
╽ ⌬ ${p}gaytest @user
┠╾━━━━━━━╼
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
╽ ⌬ ${p}character <name>
╰╾━━━━━━━━━━━━━━━╼⊷`;
  }

  getGroupMenu() {
    const p = this.prefix;
    return `『 👥 ɢʀᴏᴜᴘ ᴍᴇɴᴜ 』
╭╾━━━━━━━━━━━━━━━╼⊷
╽ 🛂 [ ᴀᴅᴍɪɴ ᴄᴏʀᴇ ]
╽ ⌬ ${p}promote @user
╽ ⌬ ${p}demote @user
╽ ⌬ ${p}mute
╽ ⌬ ${p}unmute
╽ ⌬ ${p}add <number>
╽ ⌬ ${p}kick @user
┠╾━━━━━━━╼
╽ 🛡️ [ ꜱᴀꜰᴇ-ɢᴜᴀʀᴅ ]
╽ ⌬ ${p}antilink on/off
╽ ⌬ ${p}antibot on/off
╽ ⌬ ${p}antispam on/off
╽ ⌬ ${p}antiviewonce on/off
╽ ⌬ ${p}warn @user
╽ ⌬ ${p}resetwarn @user
╽ ⌬ ${p}delete (reply)
┠╾━━━━━━━╼
╽ ⚙️ [ ɢ-ꜱᴇᴛᴛɪɴɢꜱ ]
╽ ⌬ ${p}ginfo
╽ ⌬ ${p}welcome on/off
╽ ⌬ ${p}setwelcome <text>
╽ ⌬ ${p}goodbye on/off
╽ ⌬ ${p}setgoodbye <text>
╽ ⌬ ${p}accept
╽ ⌬ ${p}acceptall
╽ ⌬ ${p}reject
╽ ⌬ ${p}rejectall
╰╾━━━━━━━━━━━━━━━╼⊷`;
  }

  getSocialMenu() {
    const p = this.prefix;
    return `『 🎭 ꜱᴏᴄɪᴀʟ ᴍᴇɴᴜ 』
╭╾━━━━━━━━━━━━━━━╼⊷
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
╽ ⌬ ${p}highfive @user
╽ ⌬ ${p}spank @user
╰╾━━━━━━━━━━━━━━━╼⊷`;
  }

  getConverterMenu() {
    const p = this.prefix;
    return `『 🔄 ᴄᴏɴᴠᴇʀᴛᴇʀ ᴍᴇɴᴜ 』
╭╾━━━━━━━━━━━━━━━╼⊷
╽ 🖼️ [ ᴍᴇᴅɪᴀ-ʟᴀʙ ]
╽ ⌬ ${p}sticker (reply)
╽ ⌬ ${p}removebg (reply)
╽ ⌬ ${p}emix (reply)
╽ ⌬ ${p}toimg (reply)
╽ ⌬ ${p}write <text>
╽ ⌬ ${p}blur (reply)
┠╾━━━━━━━╼
╽ 📄 [ ᴅᴏᴄᴜᴍᴇɴᴛ ]
╽ ⌬ ${p}topdf (reply)
╽ ⌬ ${p}totext (reply)
┠╾━━━━━━━╼
╽ 🔊 [ ꜰx-ᴇɴɢɪɴᴇ ]
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
╰╾━━━━━━━━━━━━━━━╼⊷`;
  }

  getUtilityMenu() {
    const p = this.prefix;
    return `『 🛠️ ᴜᴛɪʟɪᴛʏ 』
╭╾━━━━━━━━━━━━━━━╼⊷
╽ ⚙️ [ ʙᴏᴛ-ᴛᴏᴏʟꜱ ]
╽ ⌬ ${p}alive
╽ ⌬ ${p}ping
╽ ⌬ ${p}menu
╽ ⌬ ${p}help <command>
╽ ⌬ ${p}tagall <message>
╽ ⌬ ${p}hidetag <message>
╽ ⌬ ${p}tagadmin
╽ ⌬ ${p}translate <lang> <text>
╽ ⌬ ${p}ocr (reply image)
┠╾━━━━━━━╼
╽ 🌐 [ ᴡᴇʙ-ᴛᴏᴏʟꜱ ]
╽ ⌬ ${p}readqr (reply)
╽ ⌬ ${p}qrgen <text>
╽ ⌬ ${p}shorten <url>
┠╾━━━━━━━╼
╽ ℹ️ [ ɪɴꜰᴏ ]
╽ ⌬ ${p}news
╽ ⌬ ${p}countryinfo <country>
╽ ⌬ ${p}readmore
╽ ⌬ ${p}checkmail <email>
╽ ⌬ ${p}calc <expression>
╰╾━━━━━━━━━━━━━━━╼⊷`;
  }

  getOwnerMenu() {
    const p = this.prefix;
    return `『 👑 ᴏᴡɴᴇʀ 』
╭╾━━━━━━━━━━━━━━━╼⊷
╽ 💻 [ ꜱʏꜱ-ᴄᴏɴᴛʀᴏʟ ]
╽ ⌬ ${p}settings
╽ ⌬ ${p}invite
╽ ⌬ ${p}join <link>
╽ ⌬ ${p}autoviewstatus on/off
╽ ⌬ ${p}autoreact on/off
┠╾━━━━━━━╼
╽ 📡 [ ᴀᴜᴛᴏ-ᴍᴏᴅᴇꜱ ]
╽ ⌬ ${p}autoreply on/off
╽ ⌬ ${p}autolikestatus on/off
╽ ⌬ ${p}autoread on/off
╽ ⌬ ${p}alwaysonline on/off
╽ ⌬ ${p}ownernumber <number>
╽ ⌬ ${p}ownername <name>
┠╾━━━━━━━╼
╽ 👤 [ ᴘʀᴏꜰɪʟᴇ ]
╽ ⌬ ${p}antidelpath on/off
╽ ⌬ ${p}setprefix <prefix>
╽ ⌬ ${p}setdp (reply)
╽ ⌬ ${p}setbio <text>
╽ ⌬ ${p}setdesc <text>
╽ ⌬ ${p}setvar <key=value>
┠╾━━━━━━━╼
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
╰╾━━━━━━━━━━━━━━━╼⊷`;
  }

  // ── Alive card ───────────────────────────────────────

  getAliveMessage() {
    const s = this.getSystemStats();
    return `╭━━━━❰ 𝗩𝗮𝗻𝘁𝗮𝗴𝗲-𝗫 𝗠𝗗 ❱━━━━╮
┃ ⚡ *ʙᴏᴛ ɪꜱ ᴀʟɪᴠᴇ*
┃
┃ 👑 *ᴏᴡɴᴇʀ:*   ${this.owner}
┃ 👥 *ᴛᴇᴀᴍ:*    ${this.team}
┃ 📊 *ᴍᴇᴍᴏʀʏ:* ${s.memory}
┃ ⏱️ *ᴜᴘᴛɪᴍᴇ:* ${s.uptime}
┃ 🔣 *ᴘʀᴇꜰɪx:*  ${this.prefix}
┃ 🏷️ *ᴠᴇʀꜱɪᴏɴ:* ${this.version}
╰━━━━━━━━━━━━━━━━━━━━╯

> ᴛʏᴘᴇ ${this.prefix}menu ꜰᴏʀ ᴄᴏᴍᴍᴀɴᴅꜱ`;
  }
}

module.exports = VantageMenu;
