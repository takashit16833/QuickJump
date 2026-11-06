import * as vscode from 'vscode';
import { normalizeRevealPosition } from '../core/reveal';
import { normalizeTimerDelaySeconds } from '../core/timer';
import type { MatchMode, RevealMode, RevealOptions } from '../core/types';

export const DEFAULT_HINT_CHARACTERS = 'asdfghjkl';
export const DEFAULT_WORD_SEPARATORS = "`~!@#$%^&*()-=+[{]}\\|;:'\",.<>/?";

export type JumpMode = 'timer' | 'oneCharacter' | 'twoCharacters';

export interface QuickJumpConfig {
  readonly jumpMode: JumpMode;
  readonly matchMode: MatchMode;
  readonly caseSensitive: boolean;
  readonly hintCharacters: string;
  readonly timerDelayMs: number;
  readonly reveal: RevealOptions;
}

export const readConfig = (): QuickJumpConfig => {
  const config = vscode.workspace.getConfiguration('quickJump');
  return {
    jumpMode: config.get<JumpMode>('jumpMode', 'timer'),
    matchMode: config.get<MatchMode>('matchMode', 'wordStart'),
    caseSensitive: config.get<boolean>('caseSensitive', false),
    hintCharacters: config.get<string>('hintCharacters', DEFAULT_HINT_CHARACTERS),
    timerDelayMs: Math.round(normalizeTimerDelaySeconds(config.get<number>('timerDelay', 0.5)) * 1000),
    reveal: {
      mode: config.get<RevealMode>('revealMode', 'keep'),
      position: normalizeRevealPosition(config.get<number>('revealPosition', 25)),
    },
  };
};

export const readWordSeparators = (document: vscode.TextDocument): string =>
  vscode.workspace
    .getConfiguration('editor', document.uri)
    .get<string>('wordSeparators', DEFAULT_WORD_SEPARATORS);
