# Changelog

All notable changes to **VANTAGE-X MD** are documented here.
The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) and the project adheres to [Semantic Versioning](https://semver.org/).

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