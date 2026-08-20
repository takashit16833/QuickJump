import * as vscode from 'vscode';
import type { Candidate, HintCandidate } from '../core/types';

export interface HintRenderer extends vscode.Disposable {
  render(editors: readonly vscode.TextEditor[], hints: readonly HintCandidate<Candidate>[]): void;
  clear(): void;
}

export const createHintRenderer = (): HintRenderer => {
  const decorationType = vscode.window.createTextEditorDecorationType({
    color: 'transparent',
  });
  let decoratedEditors: readonly vscode.TextEditor[] = [];

  const clear = (): void => {
    decoratedEditors.forEach((editor) => {
      try {
        editor.setDecorations(decorationType, []);
      } catch {
        // The editor may have disappeared while the session was being cancelled.
      }
    });
    decoratedEditors = [];
  };

  const render = (
    editors: readonly vscode.TextEditor[],
    hints: readonly HintCandidate<Candidate>[],
  ): void => {
    clear();

    const byEditor = new Map<number, vscode.DecorationOptions[]>();
    hints.forEach(({ candidate, hint }) => {
      const editor = editors[candidate.editorIndex];
      if (!editor) {
        return;
      }

      const lineText = editor.document.lineAt(candidate.line).text;
      const hiddenLength = Math.max(1, Math.min(hint.length, lineText.length - candidate.character));
      const range = new vscode.Range(
        candidate.line,
        candidate.character,
        candidate.line,
        candidate.character + hiddenLength,
      );
      const options = byEditor.get(candidate.editorIndex) ?? [];
      options.push({
        range,
        renderOptions: {
          before: {
            contentText: hint,
            color: new vscode.ThemeColor('editor.background'),
            backgroundColor: new vscode.ThemeColor('editorWarning.foreground'),
            margin: `0 -${hint.length}ch 0 0`,
          },
        },
      });
      byEditor.set(candidate.editorIndex, options);
    });

    byEditor.forEach((options, editorIndex) => editors[editorIndex]?.setDecorations(decorationType, options));
    decoratedEditors = editors;
  };

  return {
    render,
    clear,
    dispose: () => {
      clear();
      decorationType.dispose();
    },
  };
};
