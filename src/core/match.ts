import type { MatchOptions } from './types';

const isBoundary = (line: string, index: number, separators: ReadonlySet<string>): boolean => {
  if (index === 0) {
    return true;
  }

  const previous = line[index - 1];
  return /\s/u.test(previous) || separators.has(previous);
};

const equalsAt = (
  line: string,
  query: string,
  index: number,
  caseSensitive: boolean,
): boolean => {
  const slice = line.slice(index, index + query.length);
  return caseSensitive
    ? slice === query
    : slice.toLowerCase() === query.toLowerCase();
};

/**
 * Returns UTF-16 character offsets for matches in one visible source line.
 */
export const findMatchOffsets = (
  line: string,
  query: string,
  options: MatchOptions,
): readonly number[] => {
  if (query.length === 0 || query.length > line.length) {
    return [];
  }

  const separators = new Set(Array.from(options.wordSeparators));
  const offsets: number[] = [];
  const lastStart = line.length - query.length;

  for (let index = 0; index <= lastStart; index += 1) {
    if (!equalsAt(line, query, index, options.caseSensitive)) {
      continue;
    }

    if (options.mode === 'wordStart' && !isBoundary(line, index, separators)) {
      continue;
    }

    offsets.push(index);
  }

  return offsets;
};
