/** Delay in seconds before timer search switches to hint selection. */
export const normalizeTimerDelaySeconds = (seconds: number): number =>
  Number.isFinite(seconds) ? Math.max(0.1, Math.min(10, seconds)) : 0.5;
