# Security

---

## Reporting a Vulnerability

If you discover a security vulnerability, do not open a public GitHub issue. Public disclosure before a fix is available puts every user at risk.

Contact privately:

- **Email:** nord_x@tuta.io
- **Telegram:** [@N0rd_X](https://t.me/N0rd_X)

Include a description of the issue, steps to reproduce it, and any relevant context. You will receive a response within 72 hours.

---

## Session ID Safety

Your Session ID is functionally equivalent to your WhatsApp login. Anyone who has it can read your messages, send messages as you, and access your contacts.

- Never share it in a chat, issue, pull request, or screenshot
- Never commit it to a repository — use `.env` and ensure `.env` is in `.gitignore`
- If it is compromised: open WhatsApp → Settings → Linked Devices → remove the session immediately, then generate a new one at the pairing site

The pairing server delivers Session IDs via WhatsApp message only. They are never returned in an API response or displayed in a browser.

---

## Self-hosting Security

When running VANTAGE-X MD on a server:

- Keep Node.js and all dependencies up to date (`npm audit` will flag known vulnerabilities)
- Do not expose the bot's web panel port publicly unless you have a reason to — it is intended for health checks only
- The `!eval` and `!shell` commands execute arbitrary code on the host machine. They are restricted to the bot owner by design, but treat access to your owner number accordingly

---

## Responsible Disclosure Policy

Once a vulnerability is reported:

1. We confirm receipt within 72 hours
2. We assess severity and scope
3. We develop and test a fix
4. We release the fix and credit the reporter in the changelog unless anonymity is requested

We do not pursue legal action against researchers who report vulnerabilities in good faith and follow this process.
