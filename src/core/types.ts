export type MatchMode = 'wordStart' | 'anywhere';

export type RevealMode = 'keep' | 'position';

export interface RevealOptions {
  readonly mode: RevealMode;
  readonly position: number;
}

export interface MatchOptions {
  readonly mode: MatchMode;
  readonly caseSensitive: boolean;
  readonly wordSeparators: string;
}

export interface Candidate {
  readonly editorIndex: number;
  readonly viewColumn: number;
  readonly line: number;
  readonly character: number;
  readonly cursorLine: number;
  readonly cursorCharacter: number;
  readonly activeEditor: boolean;
}

export interface HintCandidate<T> {
  readonly candidate: T;
  readonly hint: string;
}
