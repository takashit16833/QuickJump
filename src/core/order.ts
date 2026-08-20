import type { Candidate } from './types';

const positionDistance = (candidate: Candidate): readonly [number, number] => [
  Math.abs(candidate.line - candidate.cursorLine),
  Math.abs(candidate.character - candidate.cursorCharacter),
];

const compareTuple = (left: readonly number[], right: readonly number[]): number => {
  for (let index = 0; index < Math.min(left.length, right.length); index += 1) {
    if (left[index] !== right[index]) {
      return left[index] - right[index];
    }
  }
  return left.length - right.length;
};

const orderKey = (candidate: Candidate): readonly number[] => {
  const [lineDistance, characterDistance] = positionDistance(candidate);
  return [
    candidate.activeEditor ? 0 : 1,
    candidate.activeEditor ? 0 : candidate.viewColumn,
    candidate.activeEditor ? 0 : candidate.editorIndex,
    lineDistance,
    characterDistance,
    candidate.line,
    candidate.character,
  ];
};

export const orderCandidates = (candidates: readonly Candidate[]): readonly Candidate[] =>
  [...candidates].sort((left, right) => compareTuple(orderKey(left), orderKey(right)));
