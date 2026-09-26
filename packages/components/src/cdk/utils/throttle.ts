export type Throttled<Args extends unknown[]> = ((...args: Args) => void) & {
  /** Abandons the current window — the next call fires immediately. */
  cancel: () => void;
};

/**
 * The leading-edge throttle: the first call fires at once and every
 * further call inside the window is dropped wholesale — no trailing
 * replay, and dropped calls do NOT re-arm the window. The shape for
 * discrete command gates: a re-entry lands right after the window
 * lapses, never queued behind it (the TimePicker's chevron steps ride
 * the stepped glide for exactly this — "scroll ends, then click
 * again").
 */
export function throttle<Args extends unknown[]>(
  fn: (...args: Args) => void,
  waitMs: number,
): Throttled<Args> {
  let timer: ReturnType<typeof setTimeout> | null = null;
  const throttled = (...args: Args) => {
    if (timer === null) {
      fn(...args);
      timer = setTimeout(() => {
        timer = null;
      }, waitMs);
    }
  };
  throttled.cancel = () => {
    if (timer !== null) {
      clearTimeout(timer);
      timer = null;
    }
  };
  return throttled;
}
