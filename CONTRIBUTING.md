# Contributing to VANTAGE-X MD

Thank you for considering contributing! 🎉 This is a truly open-source project — no hidden packages, no obfuscated code, everything visible. Contributions of all kinds are welcome.

---

## 📋 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [How Can I Contribute?](#how-can-i-contribute)
- [Development Setup](#development-setup)
- [Pull Request Process](#pull-request-process)
- [Coding Guidelines](#coding-guidelines)
- [Commit Messages](#commit-messages)

---

## Code of Conduct

- Always be respectful
- No harassment of any kind will be tolarated
- Constructive feedback only
- Help others when you can

---

## How Can I Contribute?

### Reporting Bugs

Check existing issues first. When opening a bug report, include:

- **Clear title** — describe the issue briefly
- **Steps to reproduce** — how to trigger it
- **Expected vs actual behaviour**
- **Environment** — OS, Node version, Termux vs VPS, etc.
- **Screenshots** if applicable

**Example:**

```markdown
**Bug:** Bot crashes when using !yt command

**Steps:**
1. Start bot
2. Send `!yt Never Gonna Give You Up`
3. Bot stops responding

**Expected:** Returns video or audio download
**Actual:** Bot process exits
**Environment:** Ubuntu 22.04, Node v20.11, PM2
```

### Suggesting Enhancements

Open a GitHub issue with:

- **Clear title and description**
- **Use case** — why is this needed?
- **Proposed solution** — how should it work?
- **Alternatives considered**

### Adding Commands

Commands are the most common contribution. Each command lives in `commands/<category>/<name>.js` and follows a strict export shape — see [Coding Guidelines](#coding-guidelines) below. One command per file, one file per PR unless they're closely related.

### Pull Requests

1. Fork the repo and create your branch from `main`
2. Follow the coding guidelines
3. Test your change thoroughly
4. Update any relevant documentation
5. Submit a PR with a clear description

---

## Development Setup

```bash
# 1. Fork and clone
git clone https://github.com/YOUR_USERNAME/Vantage_X-MD.git
cd Vantage_X-MD

# 2. Install dependencies
npm install

# 3. Configure
cp .env.example .env
nano .env   # Add SESSION_ID, OWNER_NUMBER at minimum

# 4. Create a feature branch
git checkout -b feature/my-new-feature

# 5. Run in debug mode
DEBUG=true npm start
```

---

## Pull Request Process

### Before Submitting

- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Complex logic has comments
- [ ] Documentation updated if relevant
- [ ] No breaking changes (or clearly documented)
- [ ] Tested on your own setup

### PR Description Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New command
- [ ] Enhancement to existing command
- [ ] Breaking change
- [ ] Documentation update

## How Has This Been Tested?
Describe your testing — what commands, what inputs, what platform

## Checklist
- [ ] Follows coding style
- [ ] Self-reviewed
- [ ] Complex code is commented
- [ ] Docs updated if needed
- [ ] No colliding command names or aliases
```

### Review Process

1. Automated checks must pass
2. Maintainer review — may request changes
3. Approval from at least one maintainer
4. Squash and merge to `main`

---

## Coding Guidelines

### JavaScript Style

```javascript
// ✅ Good
async function downloadVideo(url) {
    try {
        const video = await fetchVideo(url);
        return video;
    } catch (error) {
        console.error('Download failed:', error.message);
        throw error;
    }
}

// ❌ Bad
function downloadVideo(url){
var video=fetchVideo(url)
return video
}
```

### Rules

1. `'use strict'` at the top of every file
2. `async/await` — no raw callbacks or `.then()` chains
3. Always `try/catch` — no unhandled promise rejections
4. 4-space indentation
5. Semicolons always
6. Single quotes for strings
7. Descriptive variable names — no single letters outside loops

### File & Folder Conventions

```
commands/
  category/           ← lowercase category name
    command-name.js   ← kebab-case filename
lib/
  utilityName.js      ← camelCase for shared utilities
helpers.js            ← root-level shared helpers (don't add per-category copies)
config.js             ← lowercase
```

### Command Export Shape

Every command must export exactly this shape:

```javascript
'use strict';
const config = require('../../config');
const { send } = require('../../helpers');

module.exports = {
    name: 'commandname',          // unique, lowercase, no spaces
    aliases: ['alias1', 'alias2'], // must not collide with any other command name or alias
    category: 'category',          // matches the folder name
    description: 'What this does',
    usage: `${config.prefix}commandname <args>`,
    weight: 'heavy',               // ONLY include if command does downloads, ffmpeg, or external API calls
    ownerOnly: false,              // true for owner-only commands

    async execute(sock, msg, args) {
        try {
            // command logic

        } catch (error) {
            console.error(`[commandname] ${error.message}`);
            await sock.sendMessage(msg.key.remoteJid, { text: global.mess.error });
        }
    }
};
```

**`weight: 'heavy'`** — add this if your command does any of the following:
- Downloads files (video, audio, images)
- Runs ffmpeg or any media processing
- Calls an external API that may be slow
- Creates stickers

Leave it out for text responses, group management, lookups, or anything instant.

**Alias collisions** — before submitting, check that none of your `name` or `aliases` values match an existing command. The loader will silently overwrite the first one registered if there's a collision.

---

## Commit Messages

### Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types

| Type | When to use |
|------|-------------|
| `feat` | New command or feature |
| `fix` | Bug fix |
| `docs` | Documentation only |
| `style` | Formatting, no logic change |
| `refactor` | Code restructure, no new feature or fix |
| `perf` | Performance improvement |
| `chore` | Maintenance, dependency updates |

### Examples

```bash
feat(download): add Instagram reel downloader

Adds igstory.js to commands/download. Downloads public
Instagram stories and reels via the fabdl API.

Closes #45
```

```bash
fix(group): unmute was calling announcement instead of not_announcement

groupSettingUpdate was passed the wrong argument, which muted
the group instead of unmuting it.
```

```bash
docs(install): add FFmpeg install step for Termux users
```

### Rules

- Subject line: 50 chars max, imperative mood ("add", "fix", "update" — not "added")
- Body: wrap at 72 chars, explain what and why (not how)
- Footer: reference issues with `Closes #123`

---

## Branch Naming

```
feature/command-name       New commands or features
fix/bug-description        Bug fixes
docs/what-changed          Documentation
refactor/what-improved     Code restructure
```

Examples:

```bash
feature/facebook-downloader
fix/unmute-wrong-setting
docs/termux-ffmpeg-guide
refactor/remove-duplicate-helpers
```

---

## Testing Checklist

- [ ] Command works with valid input
- [ ] Command handles missing / invalid input gracefully
- [ ] Error path sends `global.mess.error` (not a crash)
- [ ] No console errors during normal use
- [ ] Memory usage is acceptable on Termux
- [ ] No alias collisions with existing commands
- [ ] `weight: 'heavy'` added if appropriate

---

## Need Help?

- **Questions:** [GitHub Discussions](https://github.com/N0rd-X/Vantage_X-MD/discussions)
- **Stuck:** [Support Group](https://chat.whatsapp.com/PLACEHOLDER)
- **Ideas:** [Open an Issue](https://github.com/N0rd-X/Vantage_X-MD/issues)

---

## Recognition

Contributors are:
- Added to the README acknowledgments
- Mentioned in release notes
- Credited in commit history

---

**Thank you for contributing to VANTAGE-X MD!** 🔒

<div align="center">

Made with ❤️ by the Nord-X

</div>