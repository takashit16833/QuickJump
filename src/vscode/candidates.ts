import * as vscode from 'vscode';
import { findMatchOffsets } from '../core/match';
import { orderCandidates } from '../core/order';
import type { Candidate, MatchMode } from '../core/types';
import { readWordSeparators } from './config';

export interface CandidateSnapshot {
  readonly editors: readonly vscode.TextEditor[];
  readonly candidates: readonly Candidate[];
}

interface CollectionOptions {
  readonly mode: MatchMode;
  readonly caseSensitive: boolean;
}

const visibleLineNumbers = (editor: vscode.TextEditor): readonly number[] => {
  const lines = new Set<number>();

  for (const range of editor.visibleRanges) {
    const endLine = Math.min(range.end.line, editor.document.lineCount - 1);
    for (let line = range.start.line; line <= endLine; line += 1) {
      lines.add(line);
    }
  }

  return [...lines].sort((left, right) => left - right);
};

export const collectCandidates = (
  query: string,
  options: CollectionOptions,
): CandidateSnapshot => {
  const editors = [...vscode.window.visibleTextEditors];
  const activeEditor = vscode.window.activeTextEditor;
  const candidates: Candidate[] = [];

  editors.forEach((editor, editorIndex) => {
    const cursor = editor.selection.active;
    const viewColumn = editor.viewColumn ?? Number.MAX_SAFE_INTEGER;
    const wordSeparators = readWordSeparators(editor.document);

    for (const lineNumber of visibleLineNumbers(editor)) {
      const lineText = editor.document.lineAt(lineNumber).text;
      const offsets = findMatchOffsets(lineText, query, {
        mode: options.mode,
        caseSensitive: options.caseSensitive,
        wordSeparators,
      });

      offsets.forEach((character) => {
        candidates.push({
          editorIndex,
          viewColumn,
          line: lineNumber,
          character,
          cursorLine: cursor.line,
          cursorCharacter: cursor.character,
          activeEditor: editor === activeEditor,
        });
      });
    }
  });

  return {
    editors,
    candidates: orderCandidates(candidates),
  };
};
