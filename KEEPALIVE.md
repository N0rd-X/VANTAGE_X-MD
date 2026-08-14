# Keepalive

Some hosting platforms spin down idle processes after a period of inactivity. VANTAGE-X MD has a built-in mechanism to prevent this, and supports external monitoring services for more reliable coverage.

---

## The Problem

Platforms like Render's free tier shut down any process that hasn't received an HTTP request in 15 minutes. The bot maintains a persistent WhatsApp connection, but that doesn't count as HTTP activity. Without a keepalive strategy, the bot goes offline every time it's quiet.

---

## Option 1 — Built-in Self-ping

The simplest option. The bot pings its own `/health` endpoint every 14 minutes.

Add to your `.env`:

```env
KEEPALIVE=true
```

On Render, `RENDER_EXTERNAL_URL` is injected automatically — no additional configuration needed. On other platforms, also set:

```env
PUBLIC_URL=https://your-app-url.com
```

The first ping fires one minute after startup. If the bot crashes, the ping stops until it recovers. For critical deployments, combine this with Option 2.

---

## Option 2 — External Monitoring

An external service pings your bot independently, regardless of whether the bot itself is running. This also functions as a crash notification — if the ping fails, you get an alert.

### cron-job.org

1. Create a free account at [cron-job.org](https://cron-job.org)
2. Click **Create cronjob** and fill in:

| Field | Value |
|---|---|
| Title | VANTAGE-X MD Keepalive |
| URL | `https://your-app.onrender.com/health` |
| Schedule | Every 14 minutes |
| Method | GET |
| Timeout | 30 seconds |

3. Save. You will receive email alerts if the ping fails.

Your Render URL is visible in the service dashboard under **Settings → Custom Domains**, or at the top of the deploy page.

### Alternatives

| Service | Free tier | Interval |
|---|---|---|
| [UptimeRobot](https://uptimerobot.com) | 50 monitors | 5 minutes |
| [FreshPing](https://www.freshping.io) | 50 checks | 1 minute |
| [Better Uptime](https://betteruptime.com) | 10 monitors | 3 minutes |

---

## Option 3 — Both

Enable `KEEPALIVE=true` and set up an external monitor. The self-ping handles routine operation; the external service provides crash detection and recovery monitoring. This is the recommended setup for active group bots.

---

## Verifying It Works

The bot exposes two health endpoints:

```
GET /        → { "status": "ok", "bot": "VANTAGE-X MD" }
GET /health  → { "status": "ok", "bot": "VANTAGE-X MD" }
```

Paste your app URL into a browser or point your monitoring service at `/health` to confirm the bot is responding before setting up the ping schedule.

---

## Platforms That Don't Need This

Railway, Serv00, and Discloud run processes continuously on their free tiers. If you are on one of these platforms, keepalive configuration is unnecessary. See [DEPLOYMENT.md](DEPLOYMENT.md) for platform details.
