import * as vscode from 'vscode';
import { revealTopLine } from '../core/reveal';
import type { Candidate, RevealOptions } from '../core/types';

const visibleLineCount = (editor: vscode.TextEditor): number => Math.max(
  1,
  editor.visibleRanges.reduce(
    (count, range) => count + Math.max(1, range.end.line - range.start.line + 1),
    0,
  ),
);

const revealAtPosition = (
  editor: vscode.TextEditor,
  destination: vscode.Position,
  position: number,
): void => {
  if (editor.visibleRanges.length === 0) {
    editor.revealRange(new vscode.Range(destination, destination), vscode.TextEditorRevealType.InCenter);
    return;
  }

  const topLine = revealTopLine(destination.line, visibleLineCount(editor), position);
  const top = new vscode.Position(topLine, 0);
  editor.revealRange(new vscode.Range(top, top), vscode.TextEditorRevealType.AtTop);
};

export const jumpToCandidate = async (
  editors: readonly vscode.TextEditor[],
  candidate: Candidate,
  reveal: RevealOptions,
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

  if (reveal.mode === 'position') {
    revealAtPosition(editor, destination, reveal.position);
    return;
  }

  editor.revealRange(destinationRange, vscode.TextEditorRevealType.Default);
};
