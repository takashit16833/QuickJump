import type { HintCandidate } from './types';

export const normalizeHintCharacters = (configured: string, fallback: string): readonly string[] => {
  const unique = (value: string): readonly string[] => Array.from(new Set(Array.from(value)));
  const configuredCharacters = unique(configured);

  return configuredCharacters.length >= 2 ? configuredCharacters : unique(fallback);
};

export const hintWidthForCount = (candidateCount: number, base: number): number => {
  if (candidateCount <= 0) {
    return 0;
  }
  if (base < 2) {
    throw new Error('Hint alphabet must contain at least two characters.');
  }

  let width = 1;
  let capacity = base;
  while (capacity < candidateCount) {
    width += 1;
    capacity *= base;
  }

  return width;
};

const hintForIndex = (index: number, width: number, alphabet: readonly string[]): string => {
  const base = alphabet.length;
  let value = index;
  const digits = Array<string>(width).fill(alphabet[0]);

  for (let position = width - 1; position >= 0; position -= 1) {
    digits[position] = alphabet[value % base];
    value = Math.floor(value / base);
  }

  return digits.join('');
};

export const assignHints = <T>(
  candidates: readonly T[],
  alphabet: readonly string[],
): readonly HintCandidate<T>[] => {
  const width = hintWidthForCount(candidates.length, alphabet.length);
  return candidates.map((candidate, index) => ({
    candidate,
    hint: hintForIndex(index, width, alphabet),
  }));
};

export const filterHints = <T>(
  candidates: readonly HintCandidate<T>[],
  prefix: string,
): readonly HintCandidate<T>[] => candidates.filter(({ hint }) => hint.startsWith(prefix));

export const isValidHintPrefix = <T>(
  candidates: readonly HintCandidate<T>[],
  prefix: string,
): boolean => filterHints(candidates, prefix).length > 0;
