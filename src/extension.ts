import * as vscode from 'vscode';
import { createQuickJumpController } from './controller';
import { createHintRenderer } from './vscode/decorations';
import { createQuickJumpStatusBar } from './vscode/statusBar';

const JUMP_ONE_CHARACTER = 'quickJump.jumpOneCharacter';
const JUMP_TWO_CHARACTERS = 'quickJump.jumpTwoCharacters';
const INPUT = 'quickJump.input';
const CANCEL = 'quickJump.cancel';
const BACKSPACE = 'quickJump.backspace';

/** Activates QuickJump and registers its commands and cancellation hooks. */
export function activate(context: vscode.ExtensionContext): void {
  const renderer = createHintRenderer();
  const statusBar = createQuickJumpStatusBar();
  const controller = createQuickJumpController(renderer, statusBar);

  const cancelOnContextChange = (): void => {
    if (controller.isActive()) {
      void controller.cancel();
    }
  };

  context.subscriptions.push(
    renderer,
    statusBar,
    controller,
    vscode.commands.registerCommand(JUMP_ONE_CHARACTER, () => controller.start(1)),
    vscode.commands.registerCommand(JUMP_TWO_CHARACTERS, () => controller.start(2)),
    vscode.commands.registerCommand(INPUT, (args?: { readonly text?: string }) => controller.input(args?.text ?? '')),
    vscode.commands.registerCommand(CANCEL, () => controller.cancel()),
    vscode.commands.registerCommand(BACKSPACE, () => controller.backspace()),
    vscode.window.onDidChangeActiveTextEditor(cancelOnContextChange),
    vscode.window.onDidChangeVisibleTextEditors(cancelOnContextChange),
    vscode.window.onDidChangeTextEditorVisibleRanges(cancelOnContextChange),
    vscode.window.onDidChangeTextEditorSelection(cancelOnContextChange),
    vscode.window.onDidChangeWindowState(({ focused }) => {
      if (!focused) {
        cancelOnContextChange();
      }
    }),
    vscode.workspace.onDidChangeTextDocument(cancelOnContextChange),
    vscode.workspace.onDidChangeConfiguration((event) => {
      if (event.affectsConfiguration('quickJump') || event.affectsConfiguration('editor.wordSeparators')) {
        cancelOnContextChange();
      }
    }),
  );
}

/** Deactivates QuickJump. */
export function deactivate(): void {}
