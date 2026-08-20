import * as vscode from 'vscode';

const JUMP_ONE_CHARACTER = 'quickJump.jumpOneCharacter';
const JUMP_TWO_CHARACTERS = 'quickJump.jumpTwoCharacters';

/**
 * Activates QuickJump and registers its user-facing commands.
 *
 * The MVP jump behavior is intentionally implemented in later slices so the
 * extension shell stays separate from the pure matching and hint logic.
 */
export function activate(context: vscode.ExtensionContext): void {
  context.subscriptions.push(
    vscode.commands.registerCommand(JUMP_ONE_CHARACTER, () => undefined),
    vscode.commands.registerCommand(JUMP_TWO_CHARACTERS, () => undefined),
  );
}

/**
 * Deactivates QuickJump.
 */
export function deactivate(): void {}
