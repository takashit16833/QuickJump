# QuickJump Development Guide

## Purpose

QuickJump is a deliberately small VS Code extension for keyboard-driven cursor jumps to text that is already visible on screen.

The project exists because existing jump extensions either did not match the desired interaction model or were unreliable in the target environment. Do not turn QuickJump into a general navigation, search, or symbol-browsing extension.

## Product Contract

The MVP has two user-facing commands:

1. one-character search;
2. two-character search.

A session follows this model:

```text
start command
  -> collect 1 or 2 search characters
  -> find candidates in visible editors / visible lines
  -> zero candidates: exit silently
  -> one candidate: jump immediately
  -> multiple candidates: assign and render hints
  -> collect hint characters
  -> jump when one hint is selected
```

`Esc` cancels at any time. `Backspace` removes the latest search or hint input. Invalid hint input is ignored.

Status-bar text is user-facing and must be English.

## Scope

### MVP includes

- all `vscode.window.visibleTextEditors`;
- only vertically visible ranges of each editor;
- one-character and two-character search commands;
- configurable `wordStart` / `anywhere` matching;
- case-insensitive matching by default;
- configurable hint characters;
- fixed-width, prefix-free hint labels;
- active-editor / cursor-near candidate priority;
- hint overlays at the match start;
- immediate jump for one candidate;
- `keep`, `center`, and approximate `upperThird` reveal modes;
- silent zero-match exit;
- cancellation when the editor context changes in a way that invalidates candidates.

### Explicit non-goals for MVP

- searching hidden parts of a document;
- project-wide search;
- symbol search;
- camelCase / PascalCase subword matching;
- a separate search-match highlight;
- file operations or other navigation features;
- custom hint colors and extensive appearance settings.

## Known VS Code API Constraints

`TextEditor.visibleRanges` describes vertical visibility only. It explicitly does not account for horizontal scrolling. Therefore the MVP can reliably restrict candidates to visible **lines**, but cannot determine whether an individual character on such a line is horizontally clipped.

Treat this as a platform limitation, not as a reason to add private or unsupported VS Code APIs.

`TextEditorRevealType` provides default, center, center-if-outside, and top strategies, but no fractional viewport position. `upperThird` must therefore be implemented approximately by calculating a range above the destination and revealing that range at the top. Folding and line wrapping mean the result is intentionally approximate.

## Input Capture

Use public VS Code keybinding and command APIs only.

Do **not** register the built-in `type` command. VS Code keeps extension-host command IDs in one registry and rejects duplicate registrations. Modal editor extensions such as VSCodeVim also register `type`, so overriding it would either fail or make QuickJump incompatible with the user's editor.

Instead:

- set the `quickJump.active` context key only while a session is active;
- contribute character keybindings guarded by `quickJump.active && editorTextFocus`;
- route those bindings to the internal `quickJump.input` command with the typed character in `args.text`;
- bind `Esc` to `quickJump.cancel` and `Backspace` to `quickJump.backspace` under the same context;
- keep normal typing completely untouched while QuickJump is inactive.

The built-in bindings cover Latin letters, uppercase Latin letters via Shift, digits, space, and common unshifted punctuation. This covers the default hint alphabet and user alphabets such as `otaniseh`. Do not claim arbitrary IME/composition support unless it is implemented through a public API without taking over global typing.

## Cancellation Model

The desired product behavior is: mouse interaction or another action that changes the current editor context cancels QuickJump.

Use public observable events such as:

- active editor changes;
- text editor selection changes;
- visible editor changes;
- visible range changes;
- relevant document changes.

Do not depend on undocumented internal command events. If an unrelated command produces no observable editor change, the public API may not provide a generic way to detect it; preserve correctness by cancelling whenever candidate positions can no longer be trusted.

## Matching Semantics

### `wordStart`

Do not split camelCase, PascalCase, or snake_case.

Expected behavior:

```text
getUserName     -> g
foo_bar         -> f
some-value      -> s, v
object.method   -> o, m
```

Where practical, align word-boundary behavior with VS Code's configured word separators instead of inventing a separate language-specific parser.

### `anywhere`

Every occurrence of the search text inside the eligible visible ranges is a candidate.

### Case sensitivity

Default: case-insensitive.

When case sensitivity is disabled, normalize only for comparison. Preserve the original document positions and text.

## Candidate Model

Keep the pure candidate representation independent of VS Code classes where practical.

A candidate should contain only the information required to:

- identify its source editor/document;
- identify its position;
- rank it;
- render a hint;
- jump back to the correct visible editor.

The same document may be visible in multiple editor groups. Treat each visible `TextEditor` instance as a distinct target.

## Candidate Ordering

Ordering is part of UX, not an incidental implementation detail.

MVP ordering:

1. active editor before other visible editors;
2. within the active editor, nearest candidates to its current cursor first;
3. remaining visible editors in a deterministic order;
4. within each remaining editor, use a deterministic distance/order rule.

Do not rely on object iteration order accidentally. Make ordering explicit and test it.

## Hint Generation

Default alphabet:

```text
asdfghjkl
```

Custom hint strings should be normalized to unique characters while preserving user order. Reject or safely fall back from configurations that do not provide enough unique characters.

For `base = hintCharacters.length` and `candidateCount = n`, choose the smallest positive integer `width` such that:

```text
base ** width >= n
```

Generate every hint with exactly that width, in the order of the configured hint characters.

Examples for `asdfghjkl`:

```text
<= 9 candidates    -> a, s, d, ...
10..81 candidates  -> aa, as, ad, ...
82..729 candidates -> aaa, aas, aad, ...
```

Fixed-width labels avoid ambiguous prefixes.

## Hint Rendering

Hints must appear at the match start because the user's gaze is already on the searched character.

Use `TextEditorDecorationType` / `TextEditor.setDecorations` with theme-aware values. Prefer existing VS Code theme colors. Do not add custom colors for the MVP.

The target interaction is an overlay that temporarily replaces or visually covers the first matched character without permanently changing the document. Validate the exact decoration technique in a small proof before spreading rendering logic through the extension.

Keep rendering in the VS Code adapter layer. Pure logic must not know about decoration APIs.

## Status Bar

Use one contextual status-bar item on the right side. Keep messages short and English. Do not use custom colors.

Suggested messages:

```text
QuickJump: Type 1 character
QuickJump: Type 2 characters
QuickJump: Type hint
QuickJump: Hint 1/2
```

The item exists only while a QuickJump session is active.

## Reveal Modes

### `keep`

Reveal with as little scrolling as possible.

### `center`

Use the standard center reveal behavior.

### `upperThird`

Approximate a destination around one third from the top by using the current visible-line span to calculate a preceding line and reveal that calculated range at the top.

Clamp calculations at document boundaries. Do not promise pixel-perfect one-third placement.

## Architecture

Prefer a functional core with a thin VS Code shell.

Current structure:

```text
src/
  extension.ts          # composition root; command registration and cancellation hooks
  controller.ts         # small session state machine and effect coordination
  core/
    match.ts            # pure matching
    hints.ts            # pure hint generation/filtering
    order.ts            # pure candidate ordering
    types.ts            # domain types
  vscode/
    candidates.ts       # visible editor/range -> domain candidates
    decorations.ts      # hint rendering
    statusBar.ts        # status-bar adapter
    jump.ts             # focus, selection, reveal
    config.ts           # configuration adapter
```

Input capture is intentionally declared in `package.json` as context-gated keybindings rather than implemented through a `type` interception module. Keep that constraint unless VS Code gains a public API that can capture transient typed input without conflicting with other extensions.

Do not create abstractions only because this document names them. Add modules when there is real logic to place in them.

## Coding Style

- Prefer pure functions for matching, hint generation, ordering, and state transitions.
- Make inputs and outputs explicit.
- Prefer immutable values over mutable shared state.
- Model session state explicitly rather than scattering booleans across event handlers.
- Keep side effects at the VS Code boundary.
- Avoid classes unless lifecycle or VS Code disposable ownership genuinely benefits from them.
- Do not hide control flow behind clever abstractions.
- Use precise names over comments that merely restate code.
- Keep the extension small.

A useful mental model is:

```text
VS Code state -> plain data -> pure transformation -> effects described by result -> VS Code adapter applies effects
```

## Configuration

MVP settings:

- `quickJump.matchMode`: `wordStart` | `anywhere`, default `wordStart`;
- `quickJump.caseSensitive`: boolean, default `false`;
- `quickJump.hintCharacters`: string, default `asdfghjkl`;
- `quickJump.reveal`: `keep` | `center` | `upperThird`, default `keep`.

Do not add a QuickJump-specific keybinding setting. Contribute default keybindings in `package.json`; users override them through normal VS Code keybindings.

## Default Commands and Keys

Commands:

- `quickJump.jumpOneCharacter`
- `quickJump.jumpTwoCharacters`

Default keys:

- one-character: `Ctrl+;`
- two-character: `Ctrl+Shift+;`

These defaults are intentionally ordinary and replaceable. User-specific layouts such as `F13` belong in user/dotfiles configuration, not in the extension's defaults.

## MVP Implementation Status

The MVP is implemented as the following slices:

1. session lifecycle, status bar, `Esc`, and `Backspace`;
2. pure `wordStart` / `anywhere` matching;
3. visible-editor / visible-line candidate collection;
4. deterministic candidate ordering;
5. fixed-width hint generation and prefix filtering;
6. theme-aware hint decorations at the match start;
7. focus, cursor movement, and `keep` / `center` / `upperThird` reveal behavior;
8. cancellation and cleanup on editor-context changes;
9. unit tests for matching, hints, ordering, and input-manifest invariants.

The remaining release gate is manual Extension Development Host verification, especially visual decoration behavior and coexistence with VSCodeVim.

### Manual verification matrix

Verify at minimum:

- one editor;
- horizontal and vertical split editors;
- same document in two groups;
- zero, one, few, and many candidates;
- one-character and two-character commands;
- `wordStart` and `anywhere`;
- light and dark themes;
- folded code;
- long horizontally scrolled lines (known API limitation);
- `Esc` and `Backspace` at every session stage;
- normal typing before and after a QuickJump session;
- VSCodeVim enabled while QuickJump is inactive and active.

## README vs AGENTS.md

README is for users: what QuickJump does, commands, settings, and usage.

AGENTS.md is for maintainers and AI assistants: intent, constraints, architecture, tradeoffs, and implementation status.

Keep development philosophy out of README unless it directly helps a user operate the extension.
