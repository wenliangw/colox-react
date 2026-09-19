import { useCallback, useLayoutEffect, useRef } from 'react';
import { measureTextareaContent, readTextareaMetrics } from '../utils/measure-textarea-height';
import type { UseTextareaAutosizeParams } from '../types';

/**
 * The height behavior, default-on: the control's height follows its
 * content (unbounded by default, capped at `maxRows` with internal
 * scrolling). The measurement is direct — restore the natural rows-based
 * height, read `scrollHeight`, clamp against the row bounds computed from
 * the live line-height, write the inline height back; `overflowY` flips
 * to `hidden` while growing (no scrollbar flash) and `auto` once capped.
 *
 * Manual sizing channels in as a minimum: an inline height we did not
 * write is the drag handle's committed size (the footer handle writes the
 * style directly while dragging), and it is never overridden by content —
 * explicit user sizing outranks the `rows` baseline and the measurement.
 *
 * Three triggers cover the growth paths: the native `input` listener
 * (uncontrolled typing and IME), the layout effect on the controlled
 * `value` (external feeds and the clear on the controlled path), and a
 * ResizeObserver on the control. The observer only acts on width changes
 * (re-wrap): height-only changes are our own writes or the drag —
 * measuring those would fight the grip in a loop. `adjust` is returned
 * for programmatic writes that skip all three (the clear on the
 * uncontrolled path).
 */
export const useTextareaAutosize = ({ textareaRef, config, value }: UseTextareaAutosizeParams) => {
  const { active, minRows, maxRows } = config;
  /**
   * The last height this hook wrote — distinguishes its own writes.
   */
  const lastWritten = useRef('');
  /**
   * Committed manual height (the footer drag handle's sizing).
   */
  const manualMin = useRef<number | null>(null);

  const adjust = useCallback(() => {
    if (!active) {
      return;
    }
    const el = textareaRef.current;
    if (el === null) {
      return;
    }

    const metrics = readTextareaMetrics(el);
    // A different inline height is someone else's write — the drag
    // handle's manual minimum; never let the content shrink it back.
    const current = el.style.height;
    if (current !== '' && current !== lastWritten.current) {
      const manual = Number.parseFloat(current);
      if (!Number.isNaN(manual)) {
        manualMin.current = manual;
      }
    }

    const content = measureTextareaContent(el, metrics, '');
    const rowsMin =
      minRows !== undefined && metrics.lineHeight !== undefined
        ? minRows * metrics.lineHeight + metrics.paddingBlock + metrics.borderBlock
        : 0;
    const base = Math.max(content, rowsMin, manualMin.current ?? 0);
    const max =
      maxRows !== undefined && metrics.lineHeight !== undefined
        ? maxRows * metrics.lineHeight + metrics.paddingBlock + metrics.borderBlock
        : Number.POSITIVE_INFINITY;

    const next = Math.min(base, max);
    el.style.height = `${next}px`;
    el.style.overflowY = base > max ? 'auto' : 'hidden';
    lastWritten.current = `${next}px`;
  }, [active, minRows, maxRows, textareaRef]);

  useLayoutEffect(() => {
    const el = textareaRef.current;
    if (!active) {
      // Sizing leaves no trace when the behavior is switched off.
      if (el !== null) {
        el.style.height = '';
        el.style.overflowY = '';
      }
      return;
    }
    if (el === null) {
      return;
    }

    adjust();
    el.addEventListener('input', adjust);
    let lastWidth: number | undefined;
    const onResize = (entries: ResizeObserverEntry[]) => {
      const entry = entries[entries.length - 1];
      const { width } = entry?.contentRect ?? {};
      if (width === undefined || width === lastWidth) {
        return;
      }
      lastWidth = width;
      adjust();
    };
    const observer = new ResizeObserver(onResize);
    observer.observe(el);
    return () => {
      el.removeEventListener('input', adjust);
      observer.disconnect();
      el.style.height = '';
      el.style.overflowY = '';
    };
  }, [active, adjust, textareaRef, value]);

  return { adjust };
};
