# QuickJump

**Jump to what you can already see.**

QuickJump is a small, keyboard-driven VS Code extension for jumping directly to visible text. Type one or two search characters, choose a hint, and the cursor moves there immediately — even across visible editor groups.

## Features

- One-character and two-character jump commands.
- Searches all currently visible editors and their vertically visible lines.
- `wordStart` matching by default, with optional `anywhere` matching.
- Configurable hint alphabet and deterministic hint priority.
- Immediate jump when only one candidate exists.
- Configurable reveal position from `0` to `100`.
- Theme-customizable hint foreground and background colors.
- Designed to coexist with VSCodeVim without overriding VS Code's global `type` command.

## Quick Start

QuickJump provides two commands:

| Command | Default key |
| --- | --- |
| **QuickJump: Jump by 1 Character** | `Ctrl+;` |
| **QuickJump: Jump by 2 Characters** | `Ctrl+Alt+;` |

1. Run one of the commands.
2. Type the search character or characters.
3. If multiple matches exist, type the hint shown at the destination.
4. QuickJump focuses the target editor and moves the cursor.

If exactly one match exists, QuickJump jumps immediately. If no matches exist, the session exits silently.

Default keybindings are ordinary VS Code keybindings and can be replaced in Keyboard Shortcuts or `keybindings.json`.

## Matching

The default mode is `wordStart`.

It treats the start of a word or identifier as a candidate without splitting camelCase, PascalCase, or snake_case internally:

```text
getUserName     -> g
foo_bar         -> f
some-value      -> s, v
object.method   -> o, m
```

The alternative `anywhere` mode matches every occurrence of the entered search text.

Matching is case-insensitive by default.

## Hints

The default hint characters are:

```text
asdfghjkl
```

Change `quickJump.hintCharacters` to use a different keyboard layout or preferred order.

QuickJump assigns hints in this order:

1. candidates in the active editor;
2. candidates nearest to the active cursor;
3. candidates in other visible editors in deterministic group order.

All hints in a session have the same width, so no hint can be a prefix of another. With nine hint characters:

- up to 9 candidates use one-character hints;
- up to 81 candidates use two-character hints;
- up to 729 candidates use three-character hints.

As a hint is typed, non-matching candidates disappear. Invalid hint input is ignored.

## Reveal Position

`quickJump.revealMode` controls what happens to the viewport after a jump:

- `keep` — keep the current viewport when possible. This is the default.
- `position` — place the destination near the percentage configured by `quickJump.revealPosition`.

`quickJump.revealPosition` accepts any number from `0` to `100`:

```text
0   -> near top
25  -> near upper quarter
50  -> near center
75  -> near lower quarter
100 -> near bottom
```

Example:

```json
{
  "quickJump.revealMode": "position",
  "quickJump.revealPosition": 25
}
```

The position is intentionally approximate. Folding, line wrapping, Sticky Scroll, and document boundaries can affect where a source line is displayed.

## Hint Colors

QuickJump contributes two theme colors:

- `quickJump.hintBackground`
- `quickJump.hintForeground`

Customize them through normal VS Code color customization:

```json
{
  "workbench.colorCustomizations": {
    "quickJump.hintBackground": "#FFD700",
    "quickJump.hintForeground": "#0E1117"
  }
}
```

## Settings

| Setting | Default | Values |
| --- | --- | --- |
| `quickJump.matchMode` | `wordStart` | `wordStart`, `anywhere` |
| `quickJump.caseSensitive` | `false` | `true`, `false` |
| `quickJump.hintCharacters` | `asdfghjkl` | string |
| `quickJump.revealMode` | `keep` | `keep`, `position` |
| `quickJump.revealPosition` | `25` | number from `0` to `100` |

## Cancellation

- `Esc` cancels QuickJump immediately.
- `Backspace` removes the latest hint input, or returns from hint selection to search input.
- Editor selection, viewport, document, visible-editor, or focus changes that invalidate the current candidates cancel the active session.
- Normal cancellation and zero-match results do not show notifications.

## Known Limitation

VS Code exposes visible ranges vertically, not horizontally. QuickJump therefore guarantees that candidates are on currently visible **lines**, but it cannot determine whether a character on a very long line is clipped by horizontal scrolling.

## Installation

### Visual Studio Marketplace

Install **QuickJump - Visible Text Navigation** from the VS Code Marketplace.

The extension identifier is:

```text
takashit16833.quickjump
```

### Local VSIX

From the repository root:

```sh
npm install
npm run package
code --install-extension quickjump-1.0.0.vsix
```

`npm run package` runs compile/test checks and then creates the VSIX file.

You can also use **Extensions → ... → Install from VSIX...** in VS Code.

## Support

Bug reports and feature requests are welcome in GitHub Issues:

https://github.com/takashit16833/QuickJump/issues

See [SUPPORT.md](./SUPPORT.md) for the information that is useful when reporting a problem.

## Development

Requirements:

- Node.js 22 or later
- npm
- VS Code

Install dependencies and run all checks:

```sh
npm install
npm run check
```

Press `F5` in VS Code to launch an Extension Development Host.

To build an installable VSIX:

```sh
npm run package
```

See [AGENTS.md](./AGENTS.md) for architecture, implementation rules, design constraints, and the manual verification matrix.

## License

QuickJump is released under the [MIT License](./LICENSE).
