/**
 * A custom growth plan for `useProgressStrategy`: an ascending list of
 * `[marker, durationMs]` checkpoints. Markers are percent strings —
 * `'20%'`, `'60%'`, `'99%'` — the same scale `cap` lives in, so a plan
 * and its cap stay mentally one unit (the `%` is trimmed inside).
 * Each segment runs from the previous checkpoint to its marker over
 * its duration — the first starts at 0 — at an even pace. The last
 * marker is where the run parks; a marker beyond `cap` clamps to
 * `cap` while the segment's duration still applies (the climb just
 * levels out earlier). Markers ascend, durations are positive.
 */
export type ProgressStrategy = ReadonlyArray<readonly [percent: `${number}%`, durationMs: number]>;

/**
 * Options for the route-progress strategy hook. Either the default
 * exponential curve (`cap` tunes where it parks), or a custom
 * per-segment `strategy` plan.
 */
export interface UseProgressStrategyOptions {
  /**
   * The percent the automatic growth approaches and parks at — the
   * route bar creeps toward this and waits for the caller's `done`.
   * Always the value ceiling: a plan marker beyond it clamps to it
   * (the segment's duration still applies), and a plan that ends
   * below it parks at the plan's last marker.
   * @default 99
   */
  cap?: number;
  /**
   * A custom per-segment growth plan replacing the default
   * fast-then-slow exponential curve: ascending `[marker, durationMs]`
   * checkpoints — markers as percent strings (`'20%'`, `'99%'`), the
   * last one the parking spot (clamped to `cap` when larger).
   */
  strategy?: ProgressStrategy;
}

/**
 * The route-progress strategy surface: a value the consumer feeds into
 * `Progress.Linear`, plus the three commands that drive the classic
 * top-of-page loading bar.
 */
export interface ProgressStrategyControls {
  /**
   * The current strategy value (0–100). Feed it to
   * `<Progress.Linear value={value} />`; it parks at the cap until
   * `done()` commits the run.
   */
  value: number;
  /**
   * Start the automatic growth: the value approaches the cap at a
   * fast-then-slow rate, or follows the custom `strategy` plan, and
   * parks there (around 90% it has already slowed to a crawl — the
   * "loading feels alive" burst). Idempotent: calling it again while
   * the clock runs, or after `done()`, is a no-op until `reset()`.
   */
  start: () => void;
  /**
   * Commit the run: the value jumps to 100 and the clock stops. This
   * is the moment the consumer fades the bar out (a real route commit
   * means the exchange finished, so the bar reports it and goes).
   */
  done: () => void;
  /**
   * Bring the value back to 0 and clear any running clock — the start
   * of a new route transition.
   */
  reset: () => void;
}
