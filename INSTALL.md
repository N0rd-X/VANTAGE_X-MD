# VANTAGE-X MD — Quick Install Guide

> Bot v0.0.0.6

---

## ⚡ 3-Minute Setup

### Step 1: Clone the repo

```bash
git clone https://github.com/N0rd-X/Vantage_X-MD.git
cd Vantage_X-MD
```

### Step 2: Install dependencies

```bash
npm install
```

### Step 3: Get your Session ID

Go to **[https://vantagex-pairing.onrender.com](https://vantagex-pairing.onrender.com/)** and pair your WhatsApp device. You'll receive a Session ID via WhatsApp message.

### Step 4: Configure

```bash
cp .env.example .env
```

Open `.env` and set at minimum:

```env
SESSION_ID=VANTAGE-X_your_session_id_here
OWNER_NUMBER=1234567890
PREFIX=!
BOT_NAME=VANTAGE-X MD
```

### Step 5: Start

```bash
npm start

# On Termux or low-RAM VPS, use efficiency mode:
npm run lowram
```

---

## ✅ Verify It Works

Send these to your bot number:

```
!ping        → responds with latency
!menu        → shows the full command list
!dice        → rolls a die
!calc 5+5    → returns 10
!quote       → sends an inspirational quote
```

---

## 🎮 Try More Commands

**Group commands** (bot must be admin):
```
!tagall Hello everyone!
!promote @user
!kick @user
!mute
```

**Fun:**
```
!hug @friend
!coinflip
!8ball Will this bot work?
```

**Utilities:**
```
!weather London
!translate es Hello world
!whois google.com
!stock AAPL
```

**Downloads** (heavy commands — concurrency-capped):
```
!yt song name
!song song name
Reply to image with !sticker
```

---

## 🐛 Common Issues

**"Command not found"**
Check your prefix in `.env` (default `!`). Run `!menu` to see all available commands.

**Sticker creation fails**

FFmpeg is required for stickers and media conversion:
```bash
# Ubuntu/Debian/VPS
sudo apt install ffmpeg -y

# Termux
pkg install ffmpeg -y
```

**Session expired or invalid**
```bash
rm -rf session
npm start
# Pair again at https://vantagex-pairing.onrender.com/
```

**Bot uses too much memory**
```bash
npm run lowram
# Efficiency mode limits concurrent heavy commands via the built-in concurrency cap
```

---

## 🔧 Customisation

**Change prefix** (in `.env`):
```env
PREFIX=.
```

Or use the owner command at runtime:
```
!setprefix .
```

**Change bot name:**
```env
BOT_NAME=MyBot
```

**Change owner number:**
```env
OWNER_NUMBER=27731122909
```

---

## 🌟 Deployment Options

### Termux (Android)

```bash
pkg install git nodejs ffmpeg -y
git clone https://github.com/N0rd-X/Vantage_X-MD.git
cd Vantage_X-MD
npm install
cp .env.example .env && nano .env
npm run lowram
```

### VPS (Ubuntu/Debian)

```bash
sudo apt install nodejs npm git ffmpeg -y
git clone https://github.com/N0rd-X/Vantage_X-MD.git
cd Vantage_X-MD
npm install
cp .env.example .env && nano .env

# Keep running with PM2
npm install -g pm2
pm2 start index.js --name vantagex-md
pm2 save && pm2 startup
```

### Railway / Render / Heroku

1. Fork the repo
2. Connect your fork to the platform
3. Set environment variables (`SESSION_ID`, `OWNER_NUMBER`, `PREFIX`)
4. Deploy

---

## 📚 Command Categories

| Category | Count | Example |
|----------|-------|---------|
| Fun & Games | 36 | `!coinflip`, `!trivia`, `!roulette` |
| Group Management | 25 | `!kick`, `!tagall`, `!mute` |
| Owner | 26 | `!setprefix`, `!broadcast`, `!settings` |
| Utility | 26 | `!calc`, `!weather`, `!translate` |
| Download | 19 | `!yt`, `!song`, `!threads` |
| Converter | 17 | `!sticker`, `!tomp3`, `!emix` |
| Social | 15 | `!hug`, `!slap`, `!kill` |
| Search | 14 | `!wiki`, `!movie`, `!lyrics` |
| System | 8 | `!ping`, `!uptime`, `!alive` |
| AI | 4 | 🚧 In development |
| **Total** | **190+** | |

---

**Need help?** Join the [Support Group](https://chat.whatsapp.com/PLACEHOLDER) or open an [Issue](https://github.com/N0rd-x/Vantage_X-MD/issues).

**Maintained by [Nord-X](https://t.me/N0rd_X)**