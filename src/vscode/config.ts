import * as vscode from 'vscode';
import type { MatchMode, RevealMode } from '../core/types';

export const DEFAULT_HINT_CHARACTERS = 'asdfghjkl';
export const DEFAULT_WORD_SEPARATORS = "`~!@#$%^&*()-=+[{]}\\|;:'\",.<>/?";

export interface QuickJumpConfig {
  readonly matchMode: MatchMode;
  readonly caseSensitive: boolean;
  readonly hintCharacters: string;
  readonly reveal: RevealMode;
}

export const readConfig = (): QuickJumpConfig => {
  const config = vscode.workspace.getConfiguration('quickJump');
  return {
    matchMode: config.get<MatchMode>('matchMode', 'wordStart'),
    caseSensitive: config.get<boolean>('caseSensitive', false),
    hintCharacters: config.get<string>('hintCharacters', DEFAULT_HINT_CHARACTERS),
    reveal: config.get<RevealMode>('reveal', 'keep'),
  };
};

export const readWordSeparators = (document: vscode.TextDocument): string =>
  vscode.workspace
    .getConfiguration('editor', document.uri)
    .get<string>('wordSeparators', DEFAULT_WORD_SEPARATORS);
