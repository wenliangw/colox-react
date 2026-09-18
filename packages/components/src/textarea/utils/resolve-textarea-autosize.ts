import type { ResolveTextareaAutosizeParams, ResolvedTextareaAutosize } from '../types';

/**
 * Pure translation of the `autoSize` prop into an active flag, row bounds
 * and the handle availability. `rows` itself is not needed here: the
 * measurement restores the natural rows-based height before reading, so
 * the native prop acts as the minimum baseline on its own.
 *
 * `autoSize` defaults to ON (an omitted prop and `true` are the same
 * unbounded growth world); `false` returns the fixed-rows world with
 * native scrolling. `{ maxRows }` caps growth and switches the box to
 * internal scrolling — the drag handle is intentionally absent there
 * (the scrollbar is the overflow control); the handle lives in the
 * unbounded worlds only (default / `true` / `{ minRows }`).
 */

export const resolveTextareaAutosize = ({
  autoSize,
}: ResolveTextareaAutosizeParams): ResolvedTextareaAutosize => {
  if (autoSize === false) {
    return { active: false, minRows: undefined, maxRows: undefined, resizable: false };
  }
  const config = typeof autoSize === 'object' ? autoSize : {};
  return {
    active: true,
    minRows: config.minRows,
    maxRows: config.maxRows,
    resizable: config.maxRows === undefined,
  };
};
