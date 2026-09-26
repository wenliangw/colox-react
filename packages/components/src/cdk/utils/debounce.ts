export type Debounced<Args extends unknown[]> = ((...args: Args) => void) & {
  /** Discards the pending timer — nothing queued runs afterwards. */
  cancel: () => void;
};

/**
 * The classic trailing debounce: the function runs once after the
 * calls quiet down for `waitMs` — each new call inside the window
 * re-arms it, and the last arguments win. The shape for inputs that
 * want a single settlement AFTER the activity ends (e.g. a search
 * keystream), never one that must fire on the leading edge.
 */
export function debounce<Args extends unknown[]>(
  fn: (...args: Args) => void,
  waitMs: number,
): Debounced<Args> {
  let timer: ReturnType<typeof setTimeout> | null = null;
  const debounced = (...args: Args) => {
    if (timer !== null) {
      clearTimeout(timer);
    }
    timer = setTimeout(() => {
      timer = null;
      fn(...args);
    }, waitMs);
  };
  debounced.cancel = () => {
    if (timer !== null) {
      clearTimeout(timer);
      timer = null;
    }
  };
  return debounced;
}
