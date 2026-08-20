# QuickJump

QuickJump is a small VS Code extension for jumping to visible text with as few keystrokes as possible.

It is built around one idea: **jump to what you can already see**.

## Usage

QuickJump provides two commands:

- **QuickJump: Jump by 1 Character** — type one search character, then choose a hint.
- **QuickJump: Jump by 2 Characters** — type two search characters, then choose a hint.

The search covers all currently visible text editors and only their vertically visible lines. Editors in multiple groups are searched together.

If exactly one match exists, QuickJump jumps immediately. If multiple matches exist, hint labels are overlaid at the matching positions. Type a hint to move focus and the cursor to that match.

## Default Keybindings

| Command | Default |
| --- | --- |
| Jump by 1 Character | `Ctrl+;` |
| Jump by 2 Characters | `Ctrl+Alt+;` |

These are ordinary VS Code keybindings and can be replaced in Keyboard Shortcuts or `keybindings.json`.

QuickJump captures its search and hint keys only while a jump session is active. It deliberately does **not** override VS Code's global `type` command, which helps it coexist with modal editing extensions such as VSCodeVim.

The built-in input bindings cover Latin letters (including Shift for uppercase), digits, space, and common unshifted punctuation. The default hint alphabet and `otaniseh`-style custom alphabets are fully covered.

## Matching

The default match mode is `wordStart`.

`wordStart` treats the start of an identifier or word as a candidate, without splitting camelCase, PascalCase, or snake_case internally.

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

Users can replace them with their preferred layout.

QuickJump assigns shorter, easier hints to higher-priority candidates. All hints in one session have the same length, so no hint can be a prefix of another.

With nine hint characters:

- up to 9 candidates use one-character hints;
- up to 81 candidates use two-character hints;
- up to 729 candidates use three-character hints.

As a hint is typed, non-matching candidates disappear. Invalid hint input is ignored and QuickJump keeps waiting.

## Candidate Priority

Hints are assigned in this order:

1. candidates in the active editor;
2. candidates nearest to that editor's current cursor;
3. candidates in the other visible editors in a deterministic group order.

Earlier characters in `quickJump.hintCharacters` therefore go to more likely jump targets first.

The same document shown in two editor groups is treated as two distinct visible targets.

## Display

Hint labels are overlaid at the beginning of each match, where the user's gaze is already focused. QuickJump does not add a separate highlight to every matched search string.

While QuickJump is waiting for input, a small English status-bar item is shown, for example:

```text
QuickJump: Type 1 character
QuickJump: Type 2 characters
QuickJump: Search 1/2
QuickJump: Type hint
QuickJump: Hint 1/2
```

The status-bar item disappears when the jump finishes or is cancelled.

## Jump Reveal Position

`quickJump.revealMode` controls how the destination is revealed:

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

For example:

```json
{
  "quickJump.revealMode": "position",
  "quickJump.revealPosition": 25
}
```

The position is intentionally approximate. Folding, line wrapping, Sticky Scroll, and document boundaries can affect where a source line is actually displayed.

## Hint Colors

QuickJump exposes theme colors for hint labels. Customize them with normal VS Code color customization:

```json
{
  "workbench.colorCustomizations": {
    "quickJump.hintBackground": "#FFD700",
    "quickJump.hintForeground": "#0E1117"
  }
}
```

## Cancellation

- `Esc` cancels QuickJump immediately.
- `Backspace` removes the latest hint input, or returns from hint selection to search input.
- If there are no matches, QuickJump exits silently.
- Editor selection, viewport, document, visible-editor, or focus changes that invalidate the current candidates cancel the active session.

No notification is shown for a normal cancellation or a zero-match result.

## Settings

| Setting | Default | Values |
| --- | --- | --- |
| `quickJump.matchMode` | `wordStart` | `wordStart`, `anywhere` |
| `quickJump.caseSensitive` | `false` | `true`, `false` |
| `quickJump.hintCharacters` | `asdfghjkl` | string |
| `quickJump.revealMode` | `keep` | `keep`, `position` |
| `quickJump.revealPosition` | `25` | number from `0` to `100` |

Hint colors are configured through `workbench.colorCustomizations` using `quickJump.hintBackground` and `quickJump.hintForeground`.

## Known Limitation

VS Code exposes visible ranges vertically, not horizontally. QuickJump therefore guarantees that candidates are on currently visible **lines**, but it cannot determine whether a character on a very long line is clipped by horizontal scrolling.

## Installation

QuickJump can be installed locally as a VSIX package. From the repository root:

```sh
npm install
npm run package
code --install-extension quickjump-1.0.0.vsix
```

`npm run package` runs the compile/test checks and then creates the VSIX file. The generated `*.vsix` file is ignored by Git.

You can also install the generated file from VS Code: open the Extensions view, choose **...** → **Install from VSIX...**, and select `quickjump-1.0.0.vsix`.

After installing or updating the VSIX, reload VS Code if QuickJump is not immediately available.

## Development

Requirements:

- Node.js 22 or later
- npm
- VS Code

Install dependencies, compile, and run the unit tests:

```sh
npm install
npm run check
```

Press `F5` in VS Code to launch an Extension Development Host for manual testing.

To build an installable VSIX after the checks pass:

```sh
npm run package
```

See [AGENTS.md](./AGENTS.md) for architecture, implementation rules, design constraints, and the manual verification matrix.
