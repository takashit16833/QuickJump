const DEFAULT_REVEAL_POSITION = 25;

export const normalizeRevealPosition = (position: number): number => {
  if (!Number.isFinite(position)) {
    return DEFAULT_REVEAL_POSITION;
  }
  return Math.min(100, Math.max(0, position));
};

export const revealTopLine = (
  destinationLine: number,
  visibleLineCount: number,
  position: number,
): number => {
  const lineCount = Math.max(1, visibleLineCount);
  const offset = Math.round((lineCount - 1) * (normalizeRevealPosition(position) / 100));
  return Math.max(0, destinationLine - offset);
};
