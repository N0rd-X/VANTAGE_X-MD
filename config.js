/**
 * All modules import from this file.
 * Environment variables always override the hardcoded defaults
 */

'use strict';

require('dotenv').config();
const fs    = require('fs');
const chalk = require('chalk');

// ── 1. BOT IDENTITY ─────────────────────────
const BOT = {
  name:    process.env.BOT_NAME     || 'VANTAGE-X MD',
  version: '0.0.0.6',
  owner: {
    number: process.env.OWNER_NUMBER || '27686881403',
    name:   process.env.OWNER_NAME   || 'Nord-X',
  },
  prefix:  process.env.PREFIX        || '!',
};

// ── 2. SUPPORT LINKS ────────────────────────
const LINKS = {
  whatsappGroup:   process.env.WHATSAPP_GROUP
                    || 'https://chat.whatsapp.com/PLACEHOLDER',
  whatsappChannel: process.env.WHATSAPP_CHANNEL
                    || 'https://whatsapp.com/channel/PLACEHOLDER',
  telegram:        process.env.TELEGRAM
                    || 'https://t.me/N0rd_X',
};

// ── 3. BRANDING ─────────────────────────────
const BRANDING = {
  themeEmoji: process.env.THEME_EMOJI || '🔒',
  packname:   process.env.PACKNAME    || 'Sticker By',
  author:     process.env.AUTHOR      || 'VANTAGE-X MD',
  watermark:  process.env.WM          || `VANTAGE-X MD v${BOT.version}`,
  profilePic: process.env.VANTAGEX_PP     || 'https://res.cloudinary.com/fgeb24n7/image/upload/v1783969437/owner_dhgema.png',
  sessionId:  process.env.SESSION_ID  || '',
};

// ── 4. FEATURE FLAGS ────────────────────────
//    LOW_POWER_MODE=true  disables heavy features
//    for Android (Termux) or low-RAM environments.
const lowPowerMode = process.env.LOW_POWER_MODE === 'true';

const FEATURES = {
  lowPowerMode,
  autoRecording:  lowPowerMode ? false : (process.env.AUTO_RECORDING   === 'true'),
  autoTyping:     lowPowerMode ? false : (process.env.AUTO_TYPING       === 'true'),
  autoRecordType: lowPowerMode ? false : (process.env.AUTO_RECORD_TYPE  === 'true'),
  autoRead:       lowPowerMode ? false : (process.env.AUTO_READ         === 'true'),
  autoBio:        lowPowerMode ? false : (process.env.AUTO_BIO          !== 'false'),
  anti92:         process.env.ANTI_92        === 'true',
  autoSwView:     lowPowerMode ? false : (process.env.AUTO_SW_VIEW      !== 'false'),
  welcome:        process.env.WELCOME        !== 'false',
  autoReact:      lowPowerMode ? false : (process.env.AUTO_REACT        === 'true'),
  autoLikeStatus: lowPowerMode ? false : (process.env.AUTO_LIKE_STATUS  === 'true'),
};

// ── 5. RESPONSE MESSAGES ────────────────────
const MESSAGES = {
  done:     '✅ Task completed successfully!',
  admin:    '⚠️ Admin privileges required to perform this action.',
  botAdmin: '⚠️ I need to be an admin in this chat to execute this command.',
  owner:    '⛔ Command restricted to the bot owner.',
  group:    'ℹ️ This command can only be used in group chats.',
  private:  'ℹ️ This command can only be used in private chats.',
  wait:     '⏳ Processing your request… Please wait a moment.',
  error:    '❌ An unexpected error occurred. Please try again later.',
};

// ── 6. GLOBALS (backward-compat) ────────────
global.sessionid        = BRANDING.sessionId;
global.ownernumber      = BOT.owner.number;
global.ownername        = BOT.owner.name;
global.botname          = BOT.name;
global.prefix           = BOT.prefix;
global.themeemoji       = BRANDING.themeEmoji;
global.vantagexpp       = BRANDING.profilePic;
global.packname         = BRANDING.packname;
global.author           = BRANDING.author;
global.wm               = BRANDING.watermark;
global.link             = LINKS.whatsappChannel;
global.whatsappgroup    = LINKS.whatsappGroup;
global.whatsappchannel  = LINKS.whatsappChannel;
global.telegram         = LINKS.telegram;
global.lowPowerMode     = FEATURES.lowPowerMode;
global.autoRecording    = FEATURES.autoRecording;
global.autoTyping       = FEATURES.autoTyping;
global.autorecordtype   = FEATURES.autoRecordType;
global.autoread         = FEATURES.autoRead;
global.autobio          = FEATURES.autoBio;
global.anti92           = FEATURES.anti92;
global.autoswview       = FEATURES.autoSwView;
global.welcome          = FEATURES.welcome;
global.autoreact        = FEATURES.autoReact;
global.autolikestatus   = FEATURES.autoLikeStatus;
global.mess             = MESSAGES;
global.ytname           = process.env.YT_NAME    || '';
global.socialm          = process.env.SOCIAL_M   || '';
global.location         = process.env.LOCATION   || '';
global.pairingsite      = process.env.PAIRING_SITE  || '';
global.configwizard     = process.env.CONFIG_WIZARD || '';

try {
  global.thumb = fs.readFileSync('./VantageMedia/thumb.jpg');
} catch {
  global.thumb = Buffer.alloc(0);
}

// ── 7. STARTUP LOG ──────────────────────────
if (FEATURES.lowPowerMode) {
  console.log(chalk.yellow('⚡ LOW-POWER MODE (Android/Termux) ENABLED'));
  console.log(chalk.yellow('   Auto-read, typing, recording, reactions: OFF'));
  console.log(chalk.yellow('   Memory optimisation: ACTIVE'));
}

// ── 8. HOT-RELOAD ───────────────────────────
const _self = require.resolve(__filename);
fs.watchFile(_self, () => {
  fs.unwatchFile(_self);
  console.log(chalk.redBright(`Config updated: '${__filename}' — reloading`));
  delete require.cache[_self];
  require(_self);
});

// ── 9. NAMED EXPORTS ────────────────────────
module.exports = {
  BOT, LINKS, BRANDING, FEATURES, MESSAGES,
  botname:         BOT.name,
  ownername:       BOT.owner.name,
  ownernumber:     BOT.owner.number,
  prefix:          BOT.prefix,
  themeemoji:      BRANDING.themeEmoji,
  vantagexpp:      BRANDING.profilePic,
  packname:        BRANDING.packname,
  author:          BRANDING.author,
  wm:              BRANDING.watermark,
  whatsappgroup:   LINKS.whatsappGroup,
  whatsappchannel: LINKS.whatsappChannel,
  telegram:        LINKS.telegram,
  mess:            MESSAGES,
};