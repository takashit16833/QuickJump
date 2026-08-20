import * as vscode from 'vscode';
import { assignHints, filterHints, isValidHintPrefix, normalizeHintCharacters } from './core/hints';
import type { Candidate, HintCandidate } from './core/types';
import { collectCandidates } from './vscode/candidates';
import { DEFAULT_HINT_CHARACTERS, readConfig } from './vscode/config';
import type { HintRenderer } from './vscode/decorations';
import { jumpToCandidate } from './vscode/jump';
import type { QuickJumpStatusBar } from './vscode/statusBar';

const ACTIVE_CONTEXT = 'quickJump.active';

type SearchLength = 1 | 2;

type Session =
  | {
      readonly phase: 'search';
      readonly searchLength: SearchLength;
      readonly searchInput: string;
    }
  | {
      readonly phase: 'hint';
      readonly searchLength: SearchLength;
      readonly searchInput: string;
      readonly hintInput: string;
      readonly editors: readonly vscode.TextEditor[];
      readonly hints: readonly HintCandidate<Candidate>[];
    };

export interface QuickJumpController extends vscode.Disposable {
  start(searchLength: SearchLength): Promise<void>;
  input(text: string): Promise<void>;
  backspace(): Promise<void>;
  cancel(): Promise<void>;
  isActive(): boolean;
}

const codePoints = (text: string): readonly string[] => Array.from(text);

export const createQuickJumpController = (
  renderer: HintRenderer,
  statusBar: QuickJumpStatusBar,
): QuickJumpController => {
  let session: Session | undefined;
  let disposed = false;

  const setActiveContext = async (active: boolean): Promise<void> => {
    await vscode.commands.executeCommand('setContext', ACTIVE_CONTEXT, active);
  };

  const updateStatus = (): void => {
    if (!session) {
      statusBar.hide();
      return;
    }

    if (session.phase === 'search') {
      if (session.searchInput.length === 0) {
        statusBar.show(`QuickJump: Type ${session.searchLength} ${session.searchLength === 1 ? 'character' : 'characters'}`);
      } else {
        statusBar.show(`QuickJump: Search ${codePoints(session.searchInput).length}/${session.searchLength}`);
      }
      return;
    }

    const width = session.hints[0]?.hint.length ?? 0;
    if (session.hintInput.length === 0) {
      statusBar.show('QuickJump: Type hint');
    } else {
      statusBar.show(`QuickJump: Hint ${codePoints(session.hintInput).length}/${width}`);
    }
  };

  const finish = async (): Promise<void> => {
    session = undefined;
    renderer.clear();
    statusBar.hide();
    await setActiveContext(false);
  };

  const cancel = async (): Promise<void> => {
    if (!session) {
      return;
    }
    await finish();
  };

  const renderHintSession = (current: Extract<Session, { phase: 'hint' }>): void => {
    renderer.render(current.editors, filterHints(current.hints, current.hintInput));
    updateStatus();
  };

  const resolveSearch = async (current: Extract<Session, { phase: 'search' }>): Promise<void> => {
    const config = readConfig();
    const snapshot = collectCandidates(current.searchInput, {
      mode: config.matchMode,
      caseSensitive: config.caseSensitive,
    });

    if (snapshot.candidates.length === 0) {
      await finish();
      return;
    }

    if (snapshot.candidates.length === 1) {
      const [candidate] = snapshot.candidates;
      const editors = snapshot.editors;
      const reveal = config.reveal;
      await finish();
      await jumpToCandidate(editors, candidate, reveal);
      return;
    }

    const alphabet = normalizeHintCharacters(config.hintCharacters, DEFAULT_HINT_CHARACTERS);
    const hints = assignHints(snapshot.candidates, alphabet);
    session = {
      phase: 'hint',
      searchLength: current.searchLength,
      searchInput: current.searchInput,
      hintInput: '',
      editors: snapshot.editors,
      hints,
    };
    renderHintSession(session);
  };

  const inputOne = async (character: string): Promise<void> => {
    const current = session;
    if (!current) {
      return;
    }

    if (current.phase === 'search') {
      const searchInput = current.searchInput + character;
      const next: Session = { ...current, searchInput };
      session = next;

      if (codePoints(searchInput).length >= current.searchLength) {
        await resolveSearch(next as Extract<Session, { phase: 'search' }>);
      } else {
        updateStatus();
      }
      return;
    }

    const nextPrefix = current.hintInput + character;
    if (!isValidHintPrefix(current.hints, nextPrefix)) {
      return;
    }

    const width = codePoints(current.hints[0]?.hint ?? '').length;
    if (codePoints(nextPrefix).length >= width) {
      const selected = current.hints.find(({ hint }) => hint === nextPrefix);
      if (!selected) {
        return;
      }

      const editors = current.editors;
      const config = readConfig();
      await finish();
      await jumpToCandidate(editors, selected.candidate, config.reveal);
      return;
    }

    session = { ...current, hintInput: nextPrefix };
    renderHintSession(session);
  };

  const input = async (text: string): Promise<void> => {
    if (!session || text.length === 0) {
      return;
    }

    for (const character of codePoints(text)) {
      if (!session) {
        break;
      }
      await inputOne(character);
    }
  };

  const backspace = async (): Promise<void> => {
    const current = session;
    if (!current) {
      return;
    }

    if (current.phase === 'search') {
      const characters = codePoints(current.searchInput);
      session = { ...current, searchInput: characters.slice(0, -1).join('') };
      updateStatus();
      return;
    }

    if (current.hintInput.length > 0) {
      const characters = codePoints(current.hintInput);
      session = { ...current, hintInput: characters.slice(0, -1).join('') };
      renderHintSession(session);
      return;
    }

    const searchCharacters = codePoints(current.searchInput);
    renderer.clear();
    session = {
      phase: 'search',
      searchLength: current.searchLength,
      searchInput: searchCharacters.slice(0, -1).join(''),
    };
    updateStatus();
  };

  const start = async (searchLength: SearchLength): Promise<void> => {
    if (disposed) {
      return;
    }

    if (session) {
      await finish();
    }

    session = { phase: 'search', searchLength, searchInput: '' };
    updateStatus();
    await setActiveContext(true);
  };

  return {
    start,
    input,
    backspace,
    cancel,
    isActive: () => session !== undefined,
    dispose: () => {
      disposed = true;
      session = undefined;
      renderer.clear();
      statusBar.hide();
      void setActiveContext(false);
    },
  };
};
