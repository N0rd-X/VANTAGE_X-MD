# Deployment

This guide covers platform-specific deployment for VANTAGE-X MD. For basic local setup, see [INSTALL.md](INSTALL.md).

---

## Choosing a Platform

| Platform | Free tier | Always on | Best for |
|---|---|---|---|
| Railway | $5 credit/month | Yes | Most users — reliable, simple |
| Serv00 | Free (invite only) | Yes | Serious self-hosters — WebSocket confirmed |
| Discloud | Free | Yes | Purpose-built for bots |
| Render | Free (sleeps) | No | Pairing server, not the bot |
| Koyeb | Free (limited) | No | Light use |
| Back4app | Free (256MB RAM) | No | Light use with efficiency mode |

The bot maintains a persistent WebSocket connection to WhatsApp. Any platform that shuts down idle processes will break it. Railway, Serv00, and Discloud are the recommended options. If you use a platform with sleep mode, see [KEEPALIVE.md](KEEPALIVE.md).

---

## Railway

The simplest option for most users.

1. Create an account at [railway.app](https://railway.app)
2. New Project → Deploy from GitHub repo → select your fork
3. Add environment variables under the **Variables** tab:
   - `SESSION_ID`
   - `OWNER_NUMBER`
   - `PREFIX`
4. Railway deploys automatically on every push to `main`

Build command: `npm install`
Start command: `npm start`

---

## Render

Another simple option, suitable for set andd forge but the free tier spins down after 15 minutes of inactivity.

1. New Web Service → connect your repo
2. Set build command: `npm install`
3. Set start command: `npm start`
4. Add environment variables
5. Deploy

If you do run the bot on Render's free tier, enable the keepalive mechanism. See [KEEPALIVE.md](KEEPALIVE.md).

---

## Heroku

```bash
heroku login
heroku create your-bot-name

heroku config:set SESSION_ID=your_session_id
heroku config:set OWNER_NUMBER=your_number
heroku config:set PREFIX=!

git push heroku main
heroku ps:scale worker=1
heroku logs --tail
```

---

## Serv00

Serv00 offers truly free hosting with persistent processes and WebSocket support — confirmed working with Baileys.

1. Apply for an account at [serv00.com](https://serv00.com) — there is a waitlist
2. Once approved, SSH into your instance
3. Install Node.js via the control panel or nvm
4. Clone the repo, configure `.env`, and start with PM2

Serv00 provides daily backups and does not sleep idle processes. It is one of the best free options for this use case.

---

## Discloud

Discloud is built specifically for bots and supports WhatsApp bots on its free tier.

1. Create an account at [discloud.app](https://discloud.app)
2. Upload your project as a zip or connect via GitHub
3. Set environment variables in the Discloud dashboard
4. Deploy

Discloud handles 24/7 uptime on the free tier without any keepalive configuration.

---

## VPS (Self-hosted)

Any Linux VPS with at least 512MB RAM will run VANTAGE-X MD comfortably. 1GB is recommended for multiple heavy groups.

```bash
# Clone and install (Ubuntu/Debian)
sudo apt update && sudo apt install -y nodejs npm git ffmpeg
pip3 install yt-dlp

git clone https://github.com/N0rd-X/Vantage_X-MD.git
cd Vantage_X-MD
npm install
cp .env.example .env
nano .env

# Run with PM2
npm install -g pm2
pm2 start index.js --name vantagex-md
pm2 startup && pm2 save
```

---

## Environment Variables

Every deployment needs these set:

| Variable | Required | Notes |
|---|---|---|
| `SESSION_ID` | Yes | From the pairing site. Format: `VANTAGE-X://...` |
| `OWNER_NUMBER` | Yes | International format, no + or spaces |
| `PREFIX` | No | Default: `!` |
| `KEEPALIVE` | No | Set `true` on Render or any sleep-prone platform |
| `PUBLIC_URL` | No | Your app's public URL — required for keepalive on non-Render platforms |
| `MAX_CONCURRENT_HEAVY` | No | Default: `3`. Lower on weak hardware |

---

## Health Check

Every deployment exposes two endpoints:

```
GET /        → { "status": "ok", "bot": "VANTAGE-X MD" }
GET /health  → { "status": "ok", "bot": "VANTAGE-X MD" }
```

Use these to verify the bot is running, or point an uptime monitor at `/health`.
