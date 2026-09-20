# Changelog

All notable changes to **VANTAGE-X MD** are documented here.
The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) and the project adheres to [Semantic Versioning](https://semver.org/).

## [0.0.3-alpha] — 20-09-2026

### Added
- `lib/ytdlp.js` — optional `YT_COOKIES_FILE` env var; set it to a Netscape-format cookies export from a logged-in YouTube session for a reliable fallback when all client strategies are blocked

### Fixed
- `apk` and `settings` now get stlyled for `lib/messageStyle.js` import
- `ownerGuard` import was missing from 13 owner commands, was called without an import
- `!help <command>` returned "commands not loaded yet" for all queries — `global.commands` was never assigned in `index.js`; now set on initial load and kept in sync on hot-reload
- `!help <category>` silently routed to menu logic inside `help.js` — removed; `!menu` is the correct entry point for category browsing
- Download commands (`youtube`, `video`, `song`, `play`, `tiktok`, `facebook`, `instagram`, `x`) — `const wait` declared inside `try` made the catch block unable to edit the wait message on failure, leaving it hanging while a separate error message was sent below it; `wait` is now declared before `try`
- Download commands — error matching in catch only checked `err.message`, which for a failed `execFileAsync` call is a generic wrapper string; actual yt-dlp output lives in `err.stderr`, now included in both matching and logging
- `lib/ytdlp.js` — unrecognised yt-dlp errors were surfaced immediately instead of cycling through the remaining client strategies; all non-fatal errors now exhaust the full fallback chain before surfacing

### Changed
- `!youtube` rewritten as a YouTube **video** downloader (previously downloaded audio only); alias `ytaudio` removed, `ytvideo` added; non-YouTube URLs are rejected with a redirect to `!video`
- `!video` rewritten as a platform-agnostic video downloader; alias `ytvid` removed
- `!song` and `!play` — error handling and wait-message flow brought in line with the rest of the download suite
- `lib/ytdlp.js` — YouTube bot-detection strategy replaced; `ios` player client (patched by YouTube) removed in favour of a `tv_embedded → mweb → web_embedded → bare` fallback chain

---

## [0.0.2-alpha] — 14-09-2026

### Added
- `!hidetag` now reposts the exact replied message (text, image, video, sticker) with all members invisibly mentioned
- `encode` and `decode` now support `url` and `ascii` encoding types in addition to `base64`, `hex`, and `binary`
- `readqr` now checks for `zbarimg` at module load time and returns a human-readable install guide per platform (Termux / VPS / macOS) if the binary is missing rather than crashing
- `scripts/install-deps.js` now includes a `checkZbar()` step alongside the existing ffmpeg and yt-dlp checks
- `autoreply` database extended with type-based sub-files (`apk`, `doc`, `image`, `sticker`, `video`, `vn`, `zip`)

### Fixed
- `!readmore` produced a massive bubble with two "Read more" buttons — root cause was `'\u200E\n'.repeat(2700)` inserting 2700 real newlines into the message. Fixed to `'\u200E'.repeat(4001)` — no newlines, correct invisible character count
- `!tagall` was identical to `!hidetag` — now sends a distinct styled card with a numbered member list and the message above it
- `!hidetag` previously sent a plain text message regardless of what was replied to — now correctly reposts the replied content with hidden mentions
- `!apk` was deleting the loading message before sending the APK — now edits it in place
- `!ginfo`, `!welcome`, and `!goodbye` were styled with inline frame strings — now pull styling from `lib/messageStyle.js` via `card()` and `sc()` consistent with every other styled command

### Changed
- `encode` / `decode` syntax changed from `!encode base64 Hello` to `!encode Hello | base64` — splits on last pipe so text can contain pipe characters
- `config.js` now loads persistent settings from `database/settings.json` at startup so prefix, owner number, and owner name survive process restarts without re-running owner commands

### Removed
- `myfunc.js` and `myfunc2.js` — legacy files, handlers does the same better
- `VantageX.js` stub — no longer referenced anywhere

---

## [0.0.1-alpha] — 09-09-2026

First official alpha release of VANTAGE-X MD.

### Added
- WhatsApp Channel link propagated across the codebase
- `CHANGELOG.md`

### Fixed
- `!alive` and `!uptime` always displayed the hardcoded fallback version string — `config.version` was defined inside the module but never included in `module.exports`
- Command count displayed in `!menu` was inflated by alias entries — the commands `Map` stores one entry per alias, so the size reflected names plus all aliases rather than unique commands

### Changed
- Version string is now sourced exclusively from `package.json`; previously hardcoded independently in `config.js` and `menu.js`
- `VantageMenu.getAliveMessage()` removed — `alive.js` is the sole owner of the alive card; the method was never called
