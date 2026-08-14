# Installation

> VANTAGE-X MD v0.0.0.7

This guide covers setup on every supported platform. If something goes wrong, check [Troubleshooting](#troubleshooting) at the bottom.

---

## Prerequisites

| Requirement | Version | Notes |
|---|---|---|
| Node.js | 20.x | Earlier versions are not supported |
| Git | Latest | Required to clone the repo |
| FFmpeg | Any | Required for stickers, audio, and video conversion |
| yt-dlp | Latest | Required for all download commands |

FFmpeg and yt-dlp are system packages — `npm install` handles them automatically where possible. See the platform sections below for manual install commands.

---

## Getting a Session ID

Before starting the bot, you need a Session ID. Go to the pairing site and link your WhatsApp account — the ID will arrive as a WhatsApp message.

**Pairing site:** https://vantagex-pairing.onrender.com

Keep your Session ID private. It gives full access to the linked WhatsApp account.

---

## Termux (Android)

Install Termux from [F-Droid](https://f-droid.org/en/packages/com.termux/), not the Play Store — the Play Store version is outdated and unsupported.

```bash
# Update packages
pkg update -y && pkg upgrade -y

# Install dependencies
pkg install git nodejs ffmpeg yt-dlp -y

# Clone and install
git clone https://github.com/N0rd-X/Vantage_X-MD.git
cd Vantage_X-MD
npm install

# Configure
cp .env.example .env
nano .env
```

Set `SESSION_ID`, `OWNER_NUMBER`, and `PREFIX` at minimum, then save (`Ctrl+X → Y → Enter`).

```bash
# Start
npm run lowram   # recommended on Termux — enables efficiency mode
```

**Keeping it running after closing the terminal:**

```bash
pkg install screen -y
screen -S vantagex
npm run lowram
# Detach: Ctrl+A then D
# Reattach later: screen -r vantagex
```

**Common issues:**

```bash
# npm install fails with build errors
pkg install python -y
npm install --build-from-source

# Out of storage
npm cache clean --force && pkg clean

# Permission denied accessing storage
termux-setup-storage
```

---

## VPS / Server (Linux)

Tested on Ubuntu 20.04+, Debian 11+.

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Install system dependencies
sudo apt install -y git ffmpeg
pip3 install yt-dlp

# Clone and install
git clone https://github.com/N0rd-X/Vantage_X-MD.git
cd Vantage_X-MD
npm install

# Configure
cp .env.example .env
nano .env

# Start with PM2 (keeps running after logout)
npm install -g pm2
pm2 start index.js --name vantagex-md
pm2 startup
pm2 save
```

**Useful PM2 commands:**

```bash
pm2 status                          # view all processes
pm2 logs vantagex-md                # live log output
pm2 logs vantagex-md --lines 200    # last 200 lines
pm2 restart vantagex-md             # restart
pm2 stop vantagex-md                # stop
pm2 monit                           # dashboard
```

---

## Windows

1. Install [Node.js LTS](https://nodejs.org) — check "Add to PATH" during setup
2. Install [Git](https://git-scm.com/download/win) with default options
3. Install [FFmpeg](https://ffmpeg.org/download.html) and add it to PATH

Open PowerShell:

```powershell
git clone https://github.com/N0rd-X/Vantage_X-MD.git
cd Vantage_X-MD
npm install

copy .env.example .env
notepad .env

npm start
```

---

## macOS

```bash
# Install Homebrew if not already installed
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

brew install node git ffmpeg
pip3 install yt-dlp

cd ~/Desktop
git clone https://github.com/N0rd-X/Vantage_X-MD.git
cd Vantage_X-MD
npm install

cp .env.example .env
nano .env

npm start
```

---

## Configuration Reference

All settings live in `.env`. Copy `.env.example` to get started.

| Variable | Required | Description |
|---|---|---|
| `SESSION_ID` | Yes | From the pairing site. Starts with `VANTAGE-X://` |
| `OWNER_NUMBER` | Yes | Your number in international format, no + or spaces |
| `PREFIX` | No | Command prefix. Default: `!` |
| `BOT_NAME` | No | Display name. Default: `VANTAGE-X MD` |
| `KEEPALIVE` | No | Set `true` on Render to prevent idle shutdown |
| `PUBLIC_URL` | No | Your bot's public URL — used by keepalive on non-Render hosts |
| `MAX_CONCURRENT_HEAVY` | No | Concurrency cap for heavy commands. Default: `3` |

---

## Verifying the Installation

Once the bot is running, send these commands to your bot's WhatsApp number:

```
!ping       — should respond with latency in milliseconds
!alive      — shows version, uptime, and memory usage
!menu       — lists all available commands
```

---

## Troubleshooting

**Bot starts but doesn't respond to commands**
- Check the prefix in your `.env` matches what you're typing
- Group commands require the bot to have admin rights

**Sticker or download commands fail**
- FFmpeg: `ffmpeg -version` to check it's installed
- yt-dlp: `yt-dlp --version` to check it's installed and up to date (`yt-dlp -U` to update)

**Session expired or invalid**
```bash
rm -rf session
npm start
# Then pair again at the pairing site
```

**High memory on Termux**
```bash
npm run lowram
```
This enables efficiency mode, which limits how many heavy commands can run simultaneously.

**Render shuts the bot down**
See [KEEPALIVE.md](KEEPALIVE.md).
