/**
 * The approach constants for the default (no `strategy`) automatic
 * growth. Each tick walks `APPROACH_RATE` of the remaining distance
 * to the cap — the closer the value gets, the smaller the step, which
 * is the fast-then-slow route loading feel: a burst at the start that
 * eases into a crawl as it approaches the stop. Deterministic (no
 * jitter) so the curve is testable and the same on every run.
 */
export const TICK_MS = 200;
export const APPROACH_RATE = 0.1;
/** Snap onto the cap once the remaining distance is under this. */
export const SNAP_EPSILON = 0.5;

/**
 * The default parking cap: the bar creeps to 99% and waits there for
 * the caller's explicit `done()` — 99 keeps the "not quite committed"
 * truth visible, a made-up 100 would lie about the exchange.
 */
export const DEFAULT_CAP = 99;
