# QuickJump Development Guide

## Purpose

QuickJump is a deliberately small VS Code extension for keyboard-driven cursor jumps to text that is already visible on screen.

The project exists because existing jump extensions either did not match the desired interaction model or were unreliable in the target environment. Do not turn QuickJump into a general navigation, search, or symbol-browsing extension.

Current release contract: **v1.0.0**.

## Product Contract

QuickJump has two user-facing commands:

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

### v1.0 includes

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
- `keep` reveal behavior or configurable `0..100` reveal position;
- user-customizable hint foreground/background theme colors;
- silent zero-match exit;
- cancellation when the editor context changes in a way that invalidates candidates.

### Explicit non-goals for v1.0

- searching hidden parts of a document;
- project-wide search;
- symbol search;
- camelCase / PascalCase subword matching;
- a separate search-match highlight;
- file operations or other navigation features;
- extensive appearance settings beyond hint colors.

## Known VS Code API Constraints

`TextEditor.visibleRanges` describes vertical visibility only. It explicitly does not account for horizontal scrolling. Therefore QuickJump can reliably restrict candidates to visible **lines**, but cannot determine whether an individual character on such a line is horizontally clipped.

Treat this as a platform limitation, not as a reason to add private or unsupported VS Code APIs.

`TextEditorRevealType` has no arbitrary fractional viewport placement. Percentage positioning must therefore be implemented approximately: calculate the source line that should become the viewport top and reveal that line with `AtTop`.

Folding, line wrapping, Sticky Scroll, and document boundaries mean `0..100` is a semantic target rather than a pixel-perfect guarantee.

## Input Capture

Use public VS Code keybinding and command APIs only.

Do **not** register the built-in `type` command. Modal editor extensions such as VSCodeVim also register or depend on typing behavior, so overriding `type` would create compatibility problems.

Instead:

- set the `quickJump.active` context key only while a session is active;
- contribute character keybindings guarded by `quickJump.active && editorTextFocus`;
- route those bindings to the internal `quickJump.input` command with the typed character in `args.text`;
- bind `Esc` to `quickJump.cancel` and `Backspace` to `quickJump.backspace` under the same context;
- keep normal typing completely untouched while QuickJump is inactive.

The built-in bindings cover Latin letters, uppercase Latin letters via Shift, digits, space, and common unshifted punctuation. This covers the default hint alphabet and user alphabets such as `otaniseh`.

## Cancellation Model

The desired product behavior is: mouse interaction or another action that changes the current editor context cancels QuickJump.

Use public observable events such as:

- active editor changes;
- text editor selection changes;
- visible editor changes;
- visible range changes;
- relevant document changes.

Do not depend on undocumented internal command events. Preserve correctness by cancelling whenever candidate positions can no longer be trusted.

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

## Candidate Ordering

Ordering is part of UX, not an incidental implementation detail.

v1.0 ordering:

1. active editor before other visible editors;
2. within the active editor, nearest candidates to its current cursor first;
3. remaining visible editors in a deterministic order;
4. within each remaining editor, use a deterministic distance/order rule.

The same document may be visible in multiple editor groups. Treat each visible `TextEditor` instance as a distinct target.

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

Generate every hint with exactly that width. Fixed-width labels avoid ambiguous prefixes.

## Hint Rendering

Hints appear at the match start because the user's gaze is already on the searched character.

Use `TextEditorDecorationType` / `TextEditor.setDecorations`. Do not edit document text.

Hint text should use normal font weight. Avoid bold or borders unless there is a demonstrated need, because metric changes can make the editor appear to shift when hints appear or disappear.

QuickJump contributes two theme colors:

- `quickJump.hintBackground`;
- `quickJump.hintForeground`.

Users customize these through `workbench.colorCustomizations`. Keep rendering logic in the VS Code adapter layer.

## Status Bar

Use one contextual status-bar item on the right side. Keep messages short and English. Do not use custom status-bar colors.

Suggested messages:

```text
QuickJump: Type 1 character
QuickJump: Type 2 characters
QuickJump: Type hint
QuickJump: Hint 1/2
```

The item exists only while a QuickJump session is active.

## Reveal Behavior

### `keep`

`quickJump.revealMode = "keep"` uses VS Code's default reveal behavior and scrolls only when needed.

### `position`

`quickJump.revealMode = "position"` uses `quickJump.revealPosition`, a number from `0` to `100`:

```text
0   = near top
25  = near upper quarter
50  = near center
75  = near lower quarter
100 = near bottom
```

The core calculation should remain pure. For a visible line count `n`, map the percentage to an offset in `0..n-1`, subtract it from the destination line, and clamp at the beginning of the document.

The configured percentage must also be clamped defensively in code even though `package.json` declares `minimum: 0` and `maximum: 100`.

Do not add new named positions such as `upperThird`. Users can express those preferences directly as numbers.

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
    reveal.ts           # pure reveal-position calculation
    types.ts            # domain types
  vscode/
    candidates.ts       # visible editor/range -> domain candidates
    decorations.ts      # hint rendering
    statusBar.ts        # status-bar adapter
    jump.ts             # focus, selection, reveal
    config.ts           # configuration adapter
```

Input capture is intentionally declared in `package.json` as context-gated keybindings rather than implemented through global `type` interception.

## Coding Style

- Prefer pure functions for matching, hint generation, ordering, reveal calculations, and state transitions.
- Make inputs and outputs explicit.
- Prefer immutable values over mutable shared state.
- Model session state explicitly rather than scattering booleans across event handlers.
- Keep side effects at the VS Code boundary.
- Avoid classes unless lifecycle or disposable ownership genuinely benefits from them.
- Do not hide control flow behind clever abstractions.
- Use precise names over comments that merely restate code.
- Keep the extension small.

A useful mental model is:

```text
VS Code state -> plain data -> pure transformation -> VS Code adapter applies effects
```

## Configuration

v1.0 settings:

- `quickJump.matchMode`: `wordStart` | `anywhere`, default `wordStart`;
- `quickJump.caseSensitive`: boolean, default `false`;
- `quickJump.hintCharacters`: string, default `asdfghjkl`;
- `quickJump.revealMode`: `keep` | `position`, default `keep`;
- `quickJump.revealPosition`: number `0..100`, default `25`.

Theme colors:

- `quickJump.hintBackground`;
- `quickJump.hintForeground`.

Do not add a QuickJump-specific keybinding setting. Contribute default keybindings in `package.json`; users override them through normal VS Code keybindings.

## Default Commands and Keys

Commands:

- `quickJump.jumpOneCharacter`;
- `quickJump.jumpTwoCharacters`.

Default keys:

- one-character: `Ctrl+;`;
- two-character: `Ctrl+Alt+;`.

These defaults are intentionally ordinary and replaceable. User-specific layouts such as `F13` belong in user/dotfiles configuration, not in the extension's defaults.

## Verification

Automated tests should cover at least:

- `wordStart` and `anywhere` matching;
- case sensitivity;
- hint normalization, width, assignment, and filtering;
- candidate ordering;
- reveal positions `0`, `50`, and `100`, plus clamping;
- default hint keys being capturable;
- no global `type` override;
- manifest reveal settings and theme color contributions.

Manual Extension Development Host verification should cover:

- one editor;
- horizontal and vertical split editors;
- same document in two groups;
- zero, one, few, and many candidates;
- one-character and two-character commands;
- light and dark themes;
- folded code;
- `Esc` and `Backspace` at every session stage;
- normal typing before and after QuickJump;
- VSCodeVim enabled;
- reveal positions such as `0`, `25`, `50`, and `100`.

## README vs AGENTS.md

README is for users: what QuickJump does, commands, settings, and usage.

AGENTS.md is for maintainers and AI assistants: intent, constraints, architecture, tradeoffs, and implementation rules.
