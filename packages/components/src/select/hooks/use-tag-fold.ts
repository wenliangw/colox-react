import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import type { UseTagFoldArgs, UseTagFoldResult } from '../types';
import { countFittingTags } from '../utils/tag-fitting';

// SSR-safe layout measurement: the browser measures before the first
// paint, the server (and jsdom) run it as a plain effect.
const useIsomorphicLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect;

/**
 * The fold measurement behind the visual slice. The budget is derived
 * from the `.colox-select__inner` reference width minus only constant
 * reservations — the control's CSS floor, the trailing slot and the
 * gaps. Neither the row's own width (it shrinks with the slice) nor
 * the control's current width (it greedily absorbs the freed space
 * after folding) may enter the budget: both feed the count back into
 * a collapse to zero. Resize of the inner re-runs the count, so the
 * slice grows back when the shell widens.
 */
export const useTagFold = ({ values, rowRef, badgeRef }: UseTagFoldArgs): UseTagFoldResult => {
  const gapRef = useRef(0);
  const [visibleCount, setVisibleCount] = useState(values.length);

  useIsomorphicLayoutEffect(() => {
    const row = rowRef.current;
    const badge = badgeRef.current;
    const inner = row?.parentElement ?? null;
    if (row === null || badge === null || inner === null) {
      return;
    }
    const measure = () => {
      const innerWidth = inner.clientWidth;
      if (innerWidth <= 0) {
        // No layout (server, jsdom): show everything, hide the badge.
        setVisibleCount(values.length);
        return;
      }
      const control = inner.querySelector<HTMLElement>('.colox-select__control');
      const trailing = inner.querySelector<HTMLElement>('.colox-select__trailing');
      const gapCss = Number.parseFloat(getComputedStyle(inner).columnGap);
      const gap = Number.isFinite(gapCss) && gapCss >= 0 ? gapCss : 0;
      const controlMin =
        control === null ? 0 : Number.parseFloat(getComputedStyle(control).minWidth) || 0;
      const trailingWidth = trailing?.offsetWidth ?? 0;
      // inner = row + control + trailing + 2 gaps; the control keeps
      // its CSS floor, so the row budget is the constant leftover.
      const budget = Math.max(0, innerWidth - controlMin - trailingWidth - 2 * gap);

      const nodes = row.children;
      const chipWidths: number[] = [];
      for (let i = 0; i < values.length; i += 1) {
        const chip = nodes[i] as HTMLElement | undefined;
        if (chip === undefined || chip === badge) {
          break;
        }
        chipWidths.push(chip.offsetWidth);
      }
      // The flex gap follows the theme, not the fold — capture it on
      // passes where the first two chips sit in flow; after they fold,
      // fall back to the computed gap.
      const first = nodes[0] as HTMLElement | undefined;
      const second = nodes[1] as HTMLElement | undefined;
      if (
        first !== undefined &&
        second !== undefined &&
        first.style.visibility !== 'hidden' &&
        second.style.visibility !== 'hidden'
      ) {
        gapRef.current = Math.max(0, second.offsetLeft - first.offsetLeft - first.offsetWidth);
      } else {
        const computedGap = Number.parseFloat(getComputedStyle(row).columnGap);
        gapRef.current = Number.isFinite(computedGap) && computedGap >= 0 ? computedGap : 0;
      }
      setVisibleCount(countFittingTags(chipWidths, gapRef.current, budget, badge.offsetWidth));
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(inner);
    return () => observer.disconnect();
  }, [values, visibleCount, rowRef, badgeRef]);

  return { visibleCount };
};
