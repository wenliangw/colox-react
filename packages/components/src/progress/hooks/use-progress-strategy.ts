import { useCallback, useEffect, useRef, useState } from 'react';
import { APPROACH_RATE, DEFAULT_CAP, SNAP_EPSILON, TICK_MS } from '../constants/strategy';
import type {
  ProgressStrategy,
  ProgressStrategyControls,
  UseProgressStrategyOptions,
} from '../types';

/** Total runtime of a plan: the sum of its segment durations. */
function planRuntime(plan: ProgressStrategy): number {
  return plan.reduce((total, [, duration]) => total + duration, 0);
}

/**
 * Parse a percent marker (`'20%'`) to its plain number on the 0–100
 * scale by trimming: the `%` suffix is discarded, the rest is the
 * value (the marker type enforces the format at compile time).
 */
function percentOf(marker: ProgressStrategy[number][0]): number {
  const normalized = marker.trim();
  return Number(normalized.slice(0, -1));
}

/**
 * The plan curve at an elapsed instant: walk the segments — each
 * `[marker, durationMs]` runs from the previous checkpoint to its
 * percent over its duration (the first starts at 0) — and interpolate
 * linearly inside the segment that contains the instant. The `cap` is
 * the permanent ceiling: a marker beyond it clamps down to it while
 * the segment's duration still applies. Past the total runtime the
 * last (clamped) checkpoint holds. Pure: value is a function of
 * elapsed time only, so every position is deterministic and testable.
 */
function planPercentAt(plan: ProgressStrategy, elapsedMs: number, cap: number): number {
  let cumulative = 0;
  let fromPercent = 0;
  for (const [marker, duration] of plan) {
    if (elapsedMs <= cumulative + duration) {
      const fraction = duration === 0 ? 1 : (elapsedMs - cumulative) / duration;
      return fromPercent + (Math.min(percentOf(marker), cap) - fromPercent) * Math.min(fraction, 1);
    }
    cumulative += duration;
    fromPercent = Math.min(percentOf(marker), cap);
  }
  return fromPercent;
}

/**
 * The route-progress strategy: automatic fast-then-slow growth toward a
 * cap (or a per-segment `strategy` plan) plus `done`/`reset` commands.
 * The options and the returned surface are documented in `../types/hooks`.
 */
export function useProgressStrategy(
  options?: UseProgressStrategyOptions,
): ProgressStrategyControls {
  const { strategy } = options ?? {};
  const cap = options?.cap ?? DEFAULT_CAP;

  // The cap is the permanent value ceiling: plan markers beyond it
  // clamp to it (their durations still apply), while a plan that ends
  // below it parks at its last (clamped) marker.
  const plan = strategy && strategy.length > 0 ? strategy : null;
  const lastClamped = plan ? Math.min(percentOf(plan[plan.length - 1][0]), cap) : cap;

  const [value, setValue] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const doneRef = useRef(false);
  const tickRef = useRef(0);

  // The config is read through a ref so the returned commands keep
  // stable identities across renders (a consumer may pass an inline
  // plan literal); swapping the config mid-run is outside the contract.
  const configRef = useRef({ plan, totalMs: plan ? planRuntime(plan) : 0, cap, lastClamped });
  useEffect(() => {
    configRef.current = { plan, totalMs: plan ? planRuntime(plan) : 0, cap, lastClamped };
  }, [plan, cap, lastClamped]);

  const stop = useCallback(() => {
    if (timerRef.current !== null) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const start = useCallback(() => {
    // Idempotent: an already-running clock keeps running. A completed
    // run stays completed until reset re-arms it — the flag is a ref
    // so `reset(); start();` works in the same tick (the state the
    // reset committed has not rendered yet).
    if (timerRef.current !== null || doneRef.current) {
      return;
    }

    timerRef.current = setInterval(() => {
      tickRef.current += 1;
      const elapsed = tickRef.current * TICK_MS;
      const current = configRef.current;

      if (current.plan) {
        // The plan ran its course: park at its last (clamped) marker.
        if (elapsed >= current.totalMs) {
          stop();
          setValue(Math.round(current.lastClamped * 10) / 10);
          return;
        }
        // Linear interpolation inside the containing segment, rounded
        // to 1 decimal so the label stays within its reserved slot.
        setValue(Math.round(planPercentAt(current.plan, elapsed, current.cap) * 10) / 10);
        return;
      }

      setValue((prev) => {
        if (prev >= current.cap) {
          return prev;
        }
        const next = prev + (current.cap - prev) * APPROACH_RATE;
        // Commit rounded to 1 decimal: the raw float grows one decimal
        // digit per tick, which widens the default `n%` label mid-run
        // and reflows the flex track — the bar's pixel width then drops
        // backward while the number grows. A 1-decimal step stays inside
        // the label's reserved slot (<= "99.9%"), so the track never
        // reflows and the fill only moves forward.
        return current.cap - next < SNAP_EPSILON ? current.cap : Math.round(next * 10) / 10;
      });
    }, TICK_MS);
  }, [stop]);

  const done = useCallback(() => {
    stop();
    doneRef.current = true;
    setValue(100);
  }, [stop]);

  const reset = useCallback(() => {
    stop();
    doneRef.current = false;
    tickRef.current = 0;
    setValue(0);
  }, [stop]);

  // Park at the cap: once the value reaches it the remaining ticks are
  // no-ops, so stop the clock there.
  useEffect(() => {
    if (value >= cap) {
      stop();
    }
  }, [value, cap, stop]);

  // The unmount cleanup: the clock never outlives the consumer.
  useEffect(() => {
    return stop;
  }, [stop]);

  return { value, start, done, reset };
}
