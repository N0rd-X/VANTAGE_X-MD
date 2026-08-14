# Commands

This document covers the full command taxonomy — what categories exist, how to decide which category a command belongs to, which folder it lives in, and where it should appear on the menu. It is written for contributors adding new commands.

---

## Category Overview

| Category | Folder | Menu section | Description |
|---|---|---|---|
| `ai` | `commands/ai/` | AI menu | Commands that call a language or image AI model |
| `converter` | `commands/converter/` | Converter menu | Commands that transform one media type into another |
| `download` | `commands/download/` | Download menu | Commands that fetch and return remote media |
| `fun` | `commands/fun/` | Fun menu | Games, random generators, tests, economy |
| `group` | `commands/group/` | Group menu | Commands that manage a WhatsApp group |
| `owner` | `commands/owner/` | Owner menu | Bot configuration and admin commands |
| `search` | `commands/search/` | Search menu | Commands that query an external data source and return information |
| `social` | `commands/social/` | Social menu | Interaction commands directed at another user |
| `system` | `commands/system/` | System section in Owner menu | Bot status and process commands |
| `utility` | `commands/utility/` | Utility menu | General-purpose tools that don't fit another category |

---

## Deciding Where a Command Belongs

If a command fits two categories, pick the one that reflects the primary action. A command that downloads a song and converts it to mp3 is a `download` command because the primary action is fetching remote media.

---

## Menu Placement

The menu mirrors the category taxonomy. When you add a command to a category folder, add it to the corresponding menu section in `menu.js`.

Each category has one `_big*Menu()` block (shown on the main menu) and one `get*Menu()` method (shown when a user requests that category). Add the command name to the relevant `items` array in the big block, and the full usage line to the detailed method.

The menu is not exhaustive by design — only include commands that users are likely to look for. Internal helpers, stubs, and in-development commands should not appear on the menu.

---

## Command File Requirements

Every command file must export this exact shape:

```javascript
'use strict';

const config   = require('../../config');
const { send } = require('../../helpers');

module.exports = {
    name:        'commandname',      // unique across all commands, lowercase
    aliases:     ['alias1'],         // optional, must not conflict with any other name or alias
    category:    'category',         // must match the folder name exactly
    description: 'What this does',  // one line, present tense
    usage:       `${config.prefix}commandname <args>`,
    weight:      'heavy',            // include only if the command downloads files,
                                     // runs ffmpeg, or calls a slow external API
    ownerOnly:   true,               // include only when true

    async execute(sock, msg, args) {
        const jid = msg.key.remoteJid;
        try {
            // logic
        } catch (err) {
            console.error(`[commandname] ${err.message}`);
            await sock.sendMessage(jid, { text: global.mess.error });
        }
    }
};
```

**Rules:**

- `name` must be unique across all 190+ commands. Check existing files before choosing a name.
- `aliases` must also be globally unique. The loader registers aliases the same way it registers names — a collision silently overwrites the first registration.
- `weight: 'heavy'` accepts only the value `'heavy'`. Do not use `'medium'`, `'high'`, or any other string. Omit the field entirely for light commands.
- `ownerOnly` should be omitted when `false` — do not set it explicitly.
- One command per file. One file per pull request unless commands are tightly related.

---

## Command Reference

### AI

| Command | Aliases | Description |
|---|---|---|
| `deepseek` | — | DeepSeek text generation |
| `chatgpt` | — | ChatGPT text generation |
| `metaai` | — | Meta AI text generation |
| `gemini` | — | Gemini text generation |
| `perplexity` | — | Perplexity text generation |
| `claude` | — | Claude text generation |
| `imagine` | — | AI image generation |
| `nanobanana` | — | AI image generation |
| `gpt2img` | — | AI image generation |
| `remini` | enhance, upscale | Image enhancement |
| `detect` | vision, whatis | Object detection in images |

### Converter

| Command | Aliases | Description |
|---|---|---|
| `sticker` | s, stiker | Convert image or video to sticker |
| `removebg` | rbg | Remove image background |
| `emix` | emojimix | Mix two emojis |
| `toimg` | toimage | Convert sticker to image |
| `write` | typewriter | Render text as an image |
| `blur` | — | Blur an image |
| `topdf` | — | Convert document to PDF |
| `totext` | img2txt | Extract text from image (OCR) |
| `tomp3` | mp3 | Extract audio from video |
| `tovid` | tomp4 | Convert media to video |
| `togif` | — | Convert video to GIF |
| `bass` | bassboost | Apply bass boost to audio |
| `raudio` | — | Reverse audio |
| `rvideo` | — | Reverse video |
| `slowmo` | slow | Slow down video |
| `robotvo` | robot | Robot voice effect |
| `demonvo` | demon | Demon voice effect |
| `nightcore` | nc | Nightcore audio effect |
| `grayscale` | greyscale, graypic | Convert image to grayscale |
| `steal` | take, takesticker | Re-brand a sticker |

### Download

| Command | Aliases | Description |
|---|---|---|
| `youtube` | yt, ytdl | Download YouTube audio |
| `song` | music, dl | Download song as MP3 |
| `play` | playsong, stream | Download song as voice note |
| `video` | vid, ytvid | Download YouTube video |
| `image` | img, photo | Search and download an image |
| `tiktok` | tt, tik | Download TikTok video |
| `igstory` | — | Download Instagram story |
| `facebook` | fb, fbdl | Download Facebook video |
| `x` | twitter, tweet | Download X/Twitter video |
| `threads` | — | Download Threads video |
| `pinterest` | — | Download Pinterest media |
| `spotify` | — | Download Spotify track |
| `apk` | apkdl, getapk | Download an APK |
| `mediafire` | — | Download from MediaFire |
| `gdrive` | — | Download from Google Drive |
| `mega` | megadl | Download from MEGA |
| `terabox` | — | Download from Terabox |
| `gitclone` | git, ghclone | Clone a GitHub repository |

### Fun

| Command | Aliases | Description |
|---|---|---|
| `tictactoe` | ttt | Play tic-tac-toe against a user |
| `trivia` | quiz | Random trivia question |
| `math` | mathgame | Math challenge game |
| `leaderboard` | lb, top | Economy leaderboard |
| `dice` | diceroll, d6 | Roll a die |
| `slot` | slots | Slot machine |
| `coinflip` | flip | Flip a coin |
| `roulette` | — | Russian roulette |
| `aura` | — | Generate an aura score |
| `lovetest` | lovemeter | Love compatibility test |
| `gaytest` | — | Gay percentage test |
| `quote` | randomquote | Random inspirational quote |
| `roast` | — | Roast a user |
| `rlogo` | — | Random logo image |
| `rpic` | randompic | Random image |
| `rcat` | cat | Random cat image |
| `rdog` | dog | Random dog image |
| `meme` | memes, rmeme | Random meme |
| `rcos` | cos | Random cosplay image |
| `ranime` | animepic | Random anime image |
| `rwaifu` | waifu | Random waifu image |
| `truth` | — | Truth or dare — truth |
| `dare` | dareq | Truth or dare — dare |
| `joke` | jokes | Random joke |
| `pickup` | pickupline | Random pickup line |
| `mock` | sarcasm, spongebob | Mock text with alternating caps |
| `rank` | level, xp | View your rank |
| `bank` | balance, bal | View your balance |
| `daily` | — | Claim daily reward |
| `gamble` | bet, roll | Gamble coins |
| `transfer` | give, pay | Transfer coins to another user |
| `rich` | baltop, forbes | Top balances leaderboard |

### Group

| Command | Aliases | Description |
|---|---|---|
| `promote` | — | Promote member to admin |
| `demote` | — | Demote admin to member |
| `mute` | lock, close | Mute the group |
| `unmute` | open, unlock | Unmute the group |
| `add` | addmember | Add a member |
| `kick` | remove, ban | Remove a member |
| `antilink` | nolink, antilinks | Toggle antilink |
| `antibot` | — | Toggle antibot |
| `antispam` | — | Toggle antispam |
| `antiviewonce` | — | Toggle antiviewonce |
| `antinsfw` | — | Toggle NSFW detection |
| `antibadword` | badword | Toggle bad word filter |
| `warn` | — | Warn a member |
| `resetwarn` | — | Reset a member's warnings |
| `delete` | del | Delete a message |
| `ginfo` | groupinfo, gstat | Show group info |
| `welcome` | — | Toggle welcome messages |
| `setwelcome` | — | Set welcome message |
| `goodbye` | — | Toggle goodbye messages |
| `setgoodbye` | — | Set goodbye message |
| `accept` | — | Accept pending join requests |
| `acceptall` | — | Accept all pending requests |
| `reject` | — | Reject pending join requests |
| `rejectall` | — | Reject all pending requests |
| `autosticker` | — | Toggle auto sticker |
| `tagall` | — | Tag all members |
| `hidetag` | htag, hall | Tag all members silently |
| `tagadmin` | — | Tag all admins |

### Owner

| Command | Aliases | Description |
|---|---|---|
| `settings` | config, cfg | View bot configuration |
| `invite` | — | Get group invite link |
| `join` | — | Join a group via link |
| `audiviewstatus` | — | Toggle audio view status |
| `autoreact` | — | Toggle auto react |
| `autoreply` | — | Toggle auto reply |
| `autolikestatus` | — | Toggle auto like status |
| `autoread` | — | Toggle auto read |
| `alwaysonline` | — | Toggle always online |
| `owner` | getowner, ownercontact | Send owner contact card |
| `ownernumber` | setowner | Set owner number |
| `ownername` | — | Set owner name |
| `antidelpath` | — | Toggle anti-delete |
| `setprefix` | prefix | Change command prefix |
| `setdp` | — | Set bot profile picture |
| `setbio` | — | Set bot bio |
| `setdesc` | — | Set bot description |
| `setvar` | — | Set a config variable |
| `setmenuimg` | — | Set the menu thumbnail |
| `eval` | exec, > | Execute JavaScript |
| `shell` | term, $ | Execute a shell command |
| `cleanup` | — | Clean up temp files |
| `broadcast` | — | Broadcast to all chats |
| `restart` | reboot | Restart the bot |
| `shutdown` | poweroff, stop | Shut down the bot |
| `block` | — | Block a user |
| `unblock` | — | Unblock a user |

### Search

| Command | Aliases | Description |
|---|---|---|
| `google` | g, search | Web search |
| `wikipedia` | wiki, wp | Wikipedia article |
| `weather` | forecast, temp | Weather forecast |
| `ytsearch` | yts, youtubesearch | YouTube search |
| `ttsearch` | — | TikTok search |
| `igsearch` | instasearch, igscan | Instagram profile search |
| `xsearch` | — | X/Twitter search |
| `lyrics` | lyric, songtext | Song lyrics |
| `dictionary` | dict, define | Word definition |
| `urbandict` | ud | Urban Dictionary |
| `ssweb` | screenshot, webss | Screenshot a website |
| `anime` | anisearch | Anime info |
| `manga` | mangasearch | Manga search |
| `character` | — | Anime character info |
| `movie` | — | Movie info |
| `shazam` | identify, songid | Identify a song |
| `github` | — | GitHub profile/repo info |
| `npm` | — | NPM package info |
| `crypto` | price, coinprice | Cryptocurrency price |
| `stock` | stonk, ticker | Stock price |

### Social

| Command | Aliases | Description |
|---|---|---|
| `kiss` | — | Kiss a user |
| `hug` | — | Hug a user |
| `slap` | — | Slap a user |
| `lick` | — | Lick a user |
| `bite` | — | Bite a user |
| `yeet` | — | Yeet a user |
| `bonk` | — | Bonk a user |
| `pat` | — | Pat a user |
| `kill` | — | Kill a user |
| `blush` | — | Blush |
| `cuddle` | — | Cuddle a user |
| `wave` | — | Wave |
| `poke` | — | Poke a user |
| `highv` | highfive | High five a user |
| `spank` | — | Spank a user |

### System

| Command | Aliases | Description |
|---|---|---|
| `ping` | speed, latency | Check response time |
| `alive` | botinfo, bot | Bot status and system info |
| `uptime` | runtime, ut | Runtime duration |

### Utility

| Command | Aliases | Description |
|---|---|---|
| `calc` | calculate, calculator | Calculator |
| `translate` | tr, trans | Translate text |
| `afk` | — | Set AFK status |
| `poll` | — | Create a poll |
| `readqr` | — | Read a QR code |
| `qrgen` | — | Generate a QR code |
| `shorten` | — | Shorten a URL |
| `news` | headlines | Latest news |
| `countryinfo` | — | Country information |
| `readmore` | spoiler, rm | Hide text behind Read More |
| `checkmail` | — | Check email validity |
| `encode` | enc | Encode to base64/hex/binary |
| `decode` | dec | Decode from base64/hex/binary |
| `morse` | — | Convert to/from morse code |
| `fakereply` | — | Send a fake reply |
| `tempmail` | — | Generate a temporary email |
| `ghostmail` | — | Send an anonymous email |
| `passgen` | — | Generate a password |
| `whois` | domaininfo, lookup | WHOIS domain lookup |
| `ip` | — | IP address info |
| `help` | h, cmdinfo | Get details about a command |
| `menu` | — | Show the command menu |
