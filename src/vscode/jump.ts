import * as vscode from 'vscode';
import type { Candidate, RevealMode } from '../core/types';

const revealUpperThird = (editor: vscode.TextEditor, destination: vscode.Position): void => {
  const visibleRanges = editor.visibleRanges;
  if (visibleRanges.length === 0) {
    editor.revealRange(new vscode.Range(destination, destination), vscode.TextEditorRevealType.InCenter);
    return;
  }

  const visibleLineCount = Math.max(
    1,
    visibleRanges.reduce(
      (count, range) => count + Math.max(1, range.end.line - range.start.line + 1),
      0,
    ),
  );
  const topLine = Math.max(0, destination.line - Math.floor(visibleLineCount / 4));
  const top = new vscode.Position(topLine, 0);
  editor.revealRange(new vscode.Range(top, top), vscode.TextEditorRevealType.AtTop);
};

export const jumpToCandidate = async (
  editors: readonly vscode.TextEditor[],
  candidate: Candidate,
  reveal: RevealMode,
): Promise<void> => {
  const target = editors[candidate.editorIndex];
  if (!target) {
    return;
  }

  const destination = new vscode.Position(candidate.line, candidate.character);
  const editor = await vscode.window.showTextDocument(target.document, {
    viewColumn: target.viewColumn,
    preserveFocus: false,
    preview: false,
  });
  editor.selection = new vscode.Selection(destination, destination);
  const destinationRange = new vscode.Range(destination, destination);

  switch (reveal) {
    case 'center':
      editor.revealRange(destinationRange, vscode.TextEditorRevealType.InCenter);
      break;
    case 'upperThird':
      revealUpperThird(editor, destination);
      break;
    case 'keep':
    default:
      editor.revealRange(destinationRange, vscode.TextEditorRevealType.Default);
      break;
  }
};
