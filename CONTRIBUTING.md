# Contributing

Contributions are welcome. This is a genuinely open-source project — no hidden packages, no obfuscated code, no gatekeeping. If you want to improve something, this is how to do it well.

---

## Before You Start

- Check [open issues](https://github.com/N0rd-X/Vantage_X-MD/issues) to see if someone is already working on what you have in mind
- For significant changes, open an issue to discuss the approach before writing code
- Read [COMMANDS.md](COMMANDS.md) before adding a new command — it explains exactly where commands go and how they are structured

---

## Development Setup

```bash
# Fork and clone
git clone https://github.com/YOUR_USERNAME/Vantage_X-MD.git
cd Vantage_X-MD

# Install dependencies
npm install

# Configure
cp .env.example .env
nano .env   # set SESSION_ID and OWNER_NUMBER at minimum

# Create a feature branch
git checkout -b feature/your-feature-name

# Start with debug output
DEBUG=true npm start
```

---

## Types of Contributions

### Bug Reports

Open an issue with:

- A clear title describing what is broken
- Steps to reproduce the issue
- Expected behaviour and actual behaviour
- Your environment: OS, Node.js version, platform (Termux, VPS, etc.)

```markdown
**Bug:** !yt crashes the bot

**Steps:**
1. Start the bot
2. Send `!yt Never Gonna Give You Up`
3. Bot stops responding

**Expected:** Returns the audio file
**Actual:** Process exits with no error in logs

**Environment:** Ubuntu 22.04, Node v20.11, PM2
```

### Feature Requests

Open an issue with:

- A clear title and description
- The use case — why is this needed
- A proposed approach if you have one
- Alternatives you considered

### New Commands

The expected to be the most common type of contribution. Before writing the command:

1. Check [COMMANDS.md](COMMANDS.md) to determine the correct category and folder
2. Check that your chosen `name` and all `aliases` do not conflict with existing commands
3. Follow the command export shape exactly — see [COMMANDS.md](COMMANDS.md)

One command per file. One file per pull request unless the commands are closely related.

### Bug Fixes

Create a branch named `fix/description-of-fix`, make the change, write a clear commit message, and open a pull request.

---

## Code Style

All of the following apply to every file:

- `'use strict';` is the first line
- `const` for everything that is not reassigned, `let` for reassigned variables, never `var`
- `async/await` throughout — no `.then()/.catch()` chains
- Every async operation inside `try/catch`
- 4-space indentation, single quotes, semicolons everywhere
- Catch blocks log `[module-name] err.message` and send `global.mess.error` to the user

```javascript
// Correct
async function execute(sock, msg, args) {
    const jid = msg.key.remoteJid;
    try {
        const data = await fetchSomething();
        await sock.sendMessage(jid, { text: data });
    } catch (err) {
        console.error('[commandname]', err.message);
        await sock.sendMessage(jid, { text: global.mess.error });
    }
}

// Incorrect
function execute(sock, msg, args) {
    fetchSomething().then(data => {
        sock.sendMessage(msg.key.remoteJid, { text: data })
    }).catch(console.error)
}
```

For the full style guide, see [VANTAGE-X-STYLE.md](VANTAGE-X-STYLE.md).

---

## Commit Messages

Format:

```
<type>(<scope>): <subject>
```

Types:

| Type | When to use |
|---|---|
| `feat` | New command or feature |
| `fix` | Bug fix |
| `docs` | Documentation only |
| `style` | Formatting, no logic change |
| `refactor` | Code restructure, no new feature or fix |
| `perf` | Performance improvement |
| `chore` | Maintenance, dependency updates |

Examples:

```
feat(download): add instagram reel downloader
fix(group): unmute was calling announcement instead of not_announcement
docs(install): add yt-dlp install step for Ubuntu
refactor(services): remove duplicate isAdmin checks
```

Rules:
- Subject line: 50 characters maximum, imperative mood ("add", "fix", not "added", "fixed")
- Body: explain what and why, not how — wrap at 72 characters
- Reference issues in the footer: `Closes #45`

---

## Branch Naming

```
feature/description    New commands or features
fix/description        Bug fixes
docs/description       Documentation changes
refactor/description   Code restructure
```

---

## Pull Request Process

Before submitting:

- [ ] Code follows the style guide
- [ ] Self-reviewed — read your own diff before opening the PR
- [ ] Complex logic has comments explaining why, not what
- [ ] Documentation updated if the change affects it
- [ ] No alias collisions with existing commands
- [ ] `weight: 'heavy'` added if the command downloads files, runs ffmpeg, or calls a slow API
- [ ] Tested on your own setup

PR description:

```markdown
## What this does
Brief description of the change.

## Type of change
- [ ] Bug fix
- [ ] New command
- [ ] Enhancement
- [ ] Documentation update

## How it was tested
Platform, inputs used, what you verified.
```

Review process:

1. Automated checks run
2. Maintainer reviews — changes may be requested
3. Approved and squash-merged to `main`

---

## Recognition

Every contributor is credited in the release notes for the version their work ships in. Significant contributions are also noted in the README acknowledgments.

---

## Questions

- **Discussions:** [GitHub Discussions](https://github.com/N0rd-X/Vantage_X-MD/discussions)
- **Support:** [WhatsApp Group](https://chat.whatsapp.com/PLACEHOLDER)
- **Issues:** [GitHub Issues](https://github.com/N0rd-X/Vantage_X-MD/issues)
