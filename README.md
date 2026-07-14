<div align="center">

# 🔒 VANTAGE-X MD 🔒

<img src="https://raw.githubusercontent.com/N0rd-X/VANTAGE_X-MD/refs/heads/main/VantageXMedia/thumb.png" alt="VANTAGE-X MD" width="300"/>

**Fast. Smart. Yours.**

[![Version](https://img.shields.io/badge/version-0.0.0.6-blue.svg)](https://github.com/N0rd-X/Vantage_X-MD)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)
[![Node.js](https://img.shields.io/badge/node-%3E%3D18-brightgreen.svg)](https://nodejs.org)
[![Stars](https://img.shields.io/github/stars/N0rd-X/Vantage_X-MD?style=social)](https://github.com/N0rd-X/Vantage_X-MD/stargazers)

</div>

---

## 📋 Table of Contents

- [Quick Start](#-quick-start)
- [Deployment Options](#-deployment-options)
- [Features](#-features)
- [Support & Community](#-support--community)
- [Installation Guide](#-installation-guide)
  - [Termux (Android)](#termux-android)
  - [VPS / Server](#vps--server-linux)
  - [Windows](#windows)
  - [macOS](#macos)
  - [Heroku](#heroku)
  - [Railway](#railway)
- [Dependencies](#-dependencies)
- [Security](#-security)
- [Troubleshooting](#-troubleshooting)
- [Roadmap](#-roadmap)
- [License](#-license)

---

## 🚀 Quick Start

### 1. Fork This Repository

`FORK AND STAR IF YOU LIKE THIS BOT 😋`

<div align="center">
<a href="https://github.com/N0rd-X/Vantage_X-MD/fork">
  <img title="Fork VANTAGE-X MD" src="https://img.shields.io/badge/FORK-VANTAGE--X%20MD-00D9FF?style=for-the-badge&logo=github&logoColor=white">
</a>
</div>

### 2. Get Your Session ID

Pair your WhatsApp device to generate a Session ID. Use either a pairing code or QR code:

<div align="center">

<a href="https://vantagex-pairing.onrender.com/" target="_blank">
  <img alt="Get Session ID" src="https://img.shields.io/badge/Get%20Session%20ID-25D366?style=for-the-badge&logo=whatsapp&logoColor=white">
</a>

</div>

### 3. Deploy

Set `SESSION_ID` and `OWNER_NUMBER` in your `.env`, then `npm start`. Full instructions below.

---

## 🌐 Deployment Options

<div align="center">

<table>
  <tr>
    <td><a href="https://dashboard.heroku.com/new?template=https://github.com/N0rd-X/Vantage_X-MD" target="_blank"><img src="https://img.shields.io/badge/Heroku-430098?style=for-the-badge&logo=heroku&logoColor=white"/></a></td>
    <td><a href="https://railway.app/new/template?template=https://github.com/N0rd-X/Vantage_X-MD" target="_blank"><img src="https://img.shields.io/badge/Railway-000000?style=for-the-badge&logo=railway&logoColor=white"/></a></td>
  </tr>
  <tr>
    <td><a href="https://app.koyeb.com/services/deploy?type=git&repository=N0rd-X/Vantage_X-MD" target="_blank"><img src="https://img.shields.io/badge/Koyeb-FF009D?style=for-the-badge&logo=koyeb&logoColor=white"/></a></td>
    <td><a href="https://dashboard.render.com/select-repo?type=web" target="_blank"><img src="https://img.shields.io/badge/Render-000000?style=for-the-badge&logo=render&logoColor=white"/></a></td>
  </tr>
</table>

</div>

---

## ✨ Features

<div align="center">

| Feature | Status |
|---|---|
| 🔁 Anti-Delete Messages | ✅ Active |
| 📥 Multi-Platform Downloader | ✅ Active |
| 👮 Group Management Tools | ✅ Active |
| 📛 Auto Sticker Maker | ✅ Active |
| 🎮 Interactive Games & Economy | ✅ Active |
| ⚡ Efficiency Mode (concurrency cap) | ✅ Active |
| 🔒 Secure Session Delivery | ✅ Active |
| 🌐 190+ Commands across 10 categories | ✅ Active |
| 🧠 AI Commands | 🚧 In Development |

</div>

---

## 🪀 Support & Community

<div align="center">

<table>
  <tr>
    <td><a href="https://whatsapp.com/channel/PLACEHOLDER" target="_blank"><img src="https://img.shields.io/badge/WhatsApp%20Channel-25D366?style=for-the-badge&logo=whatsapp&logoColor=white"/></a></td>
  </tr>
  <tr>
    <td><a href="https://chat.whatsapp.com/PLACEHOLDER" target="_blank"><img src="https://img.shields.io/badge/Support%20Group-25D366?style=for-the-badge&logo=whatsapp&logoColor=white"/></a></td>
  </tr>
  <tr>
    <td><a href="https://t.me/N0rd_X" target="_blank"><img src="https://img.shields.io/badge/Telegram-2CA5E0?style=for-the-badge&logo=telegram&logoColor=white"/></a></td>
  </tr>
</table>

</div>

---

## 📦 Installation Guide

### Prerequisites

**Required:**
- Node.js v18.0.0 or higher
- Git (latest)
- Stable internet connection
- 500MB free storage

**Optional:**
- PM2 — keeps the bot running after closing the terminal (VPS)
- Screen / Tmux — alternative to PM2 on Termux

---

### Termux (Android)

**Step 1: Install Termux**

Download from **F-Droid** (not the Play Store — that version is outdated):
https://f-droid.org/en/packages/com.termux/

**Step 2: Update packages**

```bash
pkg update -y && pkg upgrade -y
```

**Step 3: Install dependencies**

```bash
pkg install git nodejs ffmpeg -y
node --version   # Should show v18+
```

**Step 4: Clone the repo**

```bash
cd ~
git clone https://github.com/N0rd-X/Vantage_X-MD.git
cd Vantage_X-MD
```

**Step 5: Install bot dependencies**

```bash
npm install
# Takes 5–10 minutes on Termux — this is normal
```

**Step 6: Configure**

```bash
cp .env.example .env
nano .env
# Set SESSION_ID, OWNER_NUMBER, and other fields
# Save: Ctrl+X → Y → Enter
```

**Step 7: Start the bot**

```bash
npm start

# Recommended for Termux (efficiency mode limits heavy command concurrency):
npm run lowram
```

**Keep the bot running:**

```bash
# Using screen (recommended)
pkg install screen -y
screen -S vantagex
npm run lowram
# Detach: Ctrl+A then D   |   Reattach: screen -r vantagex

# Using nohup
nohup npm run lowram > bot.log 2>&1 &
```

**Common Termux issues:**

```bash
# npm install fails
pkg install python -y
npm install --build-from-source

# Out of storage
npm cache clean --force && pkg clean

# Permission denied
termux-setup-storage
```

---

### VPS / Server (Linux)

Tested on Ubuntu 20.04+ & Debian 11+

**Step 1: Update system**

```bash
sudo apt update && sudo apt upgrade -y
```

**Step 2: Install Node.js 20**

```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs
node --version   # Should show v20.x
```

**Step 3: Clone and install**

```bash
cd ~
git clone https://github.com/N0rd-X/Vantage_X-MD.git
cd Vantage_X-MD
npm install
```

**Step 4: Configure**

```bash
cp .env.example .env
nano .env   # Set SESSION_ID, OWNER_NUMBER, etc.
```

**Step 5: Run with PM2**

```bash
sudo npm install -g pm2
pm2 start index.js --name vantagex-md
pm2 startup
pm2 save
```

**Useful PM2 commands:**

```bash
pm2 status                                              # Check running processes
pm2 logs vantagex-md --lines 100                       # View logs
pm2 restart vantagex-md                                # Restart
pm2 stop vantagex-md                                   # Stop
pm2 monit                                              # Live dashboard
pm2 start index.js --name vantagex-md --max-memory-restart 500M
pm2 start index.js --name vantagex-md --cron-restart="0 3 * * *"
```

---

### Windows

```powershell
# 1. Install Node.js LTS from https://nodejs.org (check "Add to PATH")
# 2. Install Git from https://git-scm.com/download/win

cd C:\Users\YourName\Desktop
git clone https://github.com/N0rd-X/Vantage_X-MD.git
cd Vantage_X-MD
npm install

copy .env.example .env
notepad .env   # Set your details, save and close

npm start
```

---

### macOS

```bash
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
brew install node git ffmpeg

cd ~/Desktop
git clone https://github.com/N0rd-X/Vantage_X-MD.git
cd Vantage_X-MD
npm install

cp .env.example .env
nano .env

npm start
```

---

### Heroku

```bash
heroku login
heroku create your-bot-name

heroku config:set SESSION_ID=your_session_id
heroku config:set OWNER_NUMBER=your_number

git push heroku main
heroku ps:scale worker=1
heroku logs --tail
```

---

### Railway

1. Go to [railway.app](https://railway.app) → **New Project** → **Deploy from GitHub repo**
2. Select your fork of VANTAGE-X MD
3. Add environment variables from `.env.example`: `SESSION_ID`, `OWNER_NUMBER`, etc.
4. Railway auto-deploys on push

---

## 📦 Dependencies

All declared in `package.json`. Key ones:

- **@whiskeysockets/baileys** — WhatsApp multi-device library
- **axios** — HTTP requests
- **mathjs** — Calculator commands
- **yt-dlp** — Downloader commands
- **ffmpeg** (system package) — Media conversion and sticker creation
- **qrcode** — QR code generation (pairing server)

---

## 🔒 Security

### Responsible Disclosure

If you find a security vulnerability, **do not open a public issue**.

Contact me privately:
- **Email:** nord_x@tuta.io
- **Telegram:** [@N0rdx](https://t.me/N0rd_X)

We'll respond within **72 hours**.

### Session ID Safety

Your Session ID gives full access to the paired WhatsApp account. Treat it like a password:
- Never share it publicly
- Never paste it in a group, issue, or channel
- If compromised: WhatsApp → Settings → Linked Devices → remove the session immediately

---

## 🐛 Troubleshooting

**Bot not responding:**
- Check you're using the right prefix (default: `!`)
- For group commands, the bot must have admin rights
- Check your terminal for errors

**Commands failing:**
- Run `npm install` to ensure all dependencies are present
- For media commands, ensure FFmpeg is installed

**Session expired or invalid:**
```bash
rm -rf session
npm start
# Pair again at https://vantagex-pairing.onrender.com/
```

**High memory usage on Termux:**
```bash
npm run lowram
# Efficiency mode caps how many heavy commands can run at once
```

---

## 🎯 Roadmap

- [ ] AI commands — a legit self-host-friendly middle ground that doesn't require API keys
- [ ] Advanced group moderation
- [ ] Per-group prefix support
- [ ] Full website launch

---

## 🌟 Acknowledgments

- **[WhiskeySockets/Baileys](https://github.com/WhiskeySockets/Baileys)** — The library that makes this possible
- **Nord-X** — Development and maintenance
- **Community — Every star, fork, and contribution** ❤️

---

## 📜 License

MIT License — free to use, modify, and distribute. See [LICENSE](LICENSE).

---

<div align="center">

### 🔒 VANTAGE-X MD v0.0.0.6

Made with ❤️ by [Nord-X](https://github.com/N0rd-X)

⭐ Star this repo if you like the bot!

[Pair Device](https://vantagex-pairing.onrender.com/) • [Support](https://chat.whatsapp.com/PLACEHOLDER) • [Telegram](https://t.me/N0rd_X)

</div>
