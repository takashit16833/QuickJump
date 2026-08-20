# QuickJump

QuickJump is a small VS Code extension for jumping to visible text with as few keystrokes as possible.

It is designed around one idea: **jump to what you can already see**.

> QuickJump is currently under development. The repository scaffold is in place, but the jump behavior is not implemented yet.

## Planned MVP

QuickJump will provide two commands:

- **QuickJump: Jump by 1 Character** — type one search character, then choose a hint.
- **QuickJump: Jump by 2 Characters** — type two search characters, then choose a hint.

The search covers all currently visible text editors and only their visible lines. This includes editors in multiple editor groups.

When a single match remains, QuickJump jumps immediately without asking for a hint.

When multiple matches remain, QuickJump overlays hint labels on the matching positions. Type the hint to move focus and the cursor to that match.

## Default Keybindings

| Command | Default |
| --- | --- |
| Jump by 1 Character | `Ctrl+;` |
| Jump by 2 Characters | `Ctrl+Shift+;` |

Keybindings can be changed with VS Code's standard Keyboard Shortcuts settings.

## Matching

The default match mode is `wordStart`.

`wordStart` treats the start of an identifier or word as a candidate, without splitting camelCase, PascalCase, or snake_case internally.

Examples:

```text
getUserName     -> g
foo_bar         -> f
some-value      -> s, v
object.method   -> o, m
```

The alternative `anywhere` mode matches any occurrence of the entered search text.

Matching is case-insensitive by default.

## Hints

The default hint characters are:

```text
asdfghjkl
```

Users can replace them with their preferred layout.

QuickJump uses the shortest fixed hint length that can represent every candidate. For example, with nine hint characters:

- up to 9 candidates use one-character hints;
- up to 81 candidates use two-character hints;
- up to 729 candidates use three-character hints.

All hints use the same length in a given jump session so that no hint is a prefix of another.

As a hint is typed, non-matching candidates disappear. Invalid hint input is ignored and QuickJump keeps waiting.

## Candidate Priority

Hints are assigned in a predictable priority order:

1. candidates in the active editor;
2. candidates nearest to that editor's current cursor;
3. candidates in the other visible editors.

Earlier characters in `quickJump.hintCharacters` therefore go to more likely jump targets first.

The same document shown in two editor groups is treated as two distinct visible targets.

## Display

Hint labels are overlaid at the beginning of each match. The underlying first character may be temporarily hidden while the hint is visible.

QuickJump does not add a separate highlight to the search text.

While QuickJump is waiting for input, one small status-bar item is shown in English, for example:

```text
QuickJump: Type 1 character
QuickJump: Type 2 characters
QuickJump: Type hint
QuickJump: Hint 1/2
```

The status-bar item disappears when QuickJump finishes or is cancelled.

## Jump Reveal Position

`quickJump.reveal` controls where the destination is shown after a jump:

- `keep` — keep the current viewport when possible. This is the default.
- `center` — reveal the destination near the center.
- `upperThird` — reveal the destination roughly one third from the top, leaving more code visible below it.

`upperThird` is intentionally approximate because folding and line wrapping affect the visual position of a source line.

## Cancellation

- `Esc` cancels QuickJump immediately.
- `Backspace` removes the most recent search or hint input.
- If there are no matches, QuickJump exits silently.
- Editor interactions that invalidate the current candidates cancel the active jump session.

No notification is shown for a normal cancellation or a zero-match result.

## Settings

Planned settings:

| Setting | Default | Values |
| --- | --- | --- |
| `quickJump.matchMode` | `wordStart` | `wordStart`, `anywhere` |
| `quickJump.caseSensitive` | `false` | `true`, `false` |
| `quickJump.hintCharacters` | `asdfghjkl` | string |
| `quickJump.reveal` | `keep` | `keep`, `center`, `upperThird` |

## Development

Requirements:

- Node.js 22 or later
- npm
- VS Code

Install dependencies and compile:

```sh
npm install
npm run compile
```

Press `F5` in VS Code to launch an Extension Development Host.

See [AGENTS.md](./AGENTS.md) for architecture, implementation rules, and the MVP implementation plan.
