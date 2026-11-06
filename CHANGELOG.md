# Changelog

All notable changes to QuickJump are documented here.

## 1.1.0 - 2026-11-06

- Added timer-based variable-length search with a `Ctrl+Shift+;` default shortcut.
- Added configurable `quickJump.timerDelay` (default 0.5 seconds), live candidate counts, and `Enter` confirmation.
- Preserved existing one-character and two-character navigation and `anywhere` matching.

## 1.0.0 - 2026-08-20

Initial Marketplace release.

- Added one-character and two-character visible-text jump commands.
- Added multi-editor-group candidate search over vertically visible lines.
- Added `wordStart` and `anywhere` matching modes.
- Added configurable, fixed-width hint labels with deterministic priority.
- Added VSCodeVim-friendly input capture without overriding the global `type` command.
- Added configurable reveal behavior with `keep` or numeric `0..100` positioning.
- Added customizable hint foreground and background theme colors.
- Added VSIX packaging, MIT license, and Marketplace metadata.
