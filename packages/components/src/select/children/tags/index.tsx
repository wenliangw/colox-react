import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import type { CSSProperties } from 'react';
import { IconX } from '@colox/icons';
import type { SelectTagsProps } from '../../types';
import { countFittingTags } from '../../utils/tag-fitting';

// SSR-safe layout measurement: the browser measures before the first
// paint, the server (and jsdom) run it as a plain effect.
const useIsomorphicLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect;

// The visual slice channel: a chip past the fold leaves the flex flow
// (position) and the readable tree (visibility) yet stays mounted, so
// its width stays measurable and it flows back in when the row widens.
const HIDDEN: CSSProperties = { visibility: 'hidden', position: 'absolute' };

/**
 * Multiple-mode chips: one removable pill per value. The chip label is
 * the member's `text` (the plain-text surface); a value outside the
 * compiled members falls back to the raw value string.
 *
 * The row stays single-line. Every chip stays mounted (the DOM keeps
 * the full selection), but only the leading prefix renders in flow —
 * the folded tail is visually sliced (visibility + position) and the
 * +M count chip sits in flow right after the last visible chip, never
 * overlaying anything.
 *
 * The fold budget is NOT the row's own width (it shrinks with the
 * sliced content and would collapse the count to zero) but the inner
 * row's width minus the control floor, the trailing slot and the
 * gaps — measured on the parent, so the count re-expands when the
 * shell widens. While the query grows the control past its floor the
 * real leftover is used instead. Without a layout (server, jsdom) the
 * badge hides and every chip shows.
 */
export const SelectTags = ({ values, options, disabled, onRemove }: SelectTagsProps) => {
  const rowRef = useRef<HTMLDivElement>(null);
  const badgeRef = useRef<HTMLSpanElement>(null);
  const gapRef = useRef(0);
  const [visibleCount, setVisibleCount] = useState(values.length);

  const folded = values.length - visibleCount;

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
        setVisibleCount(values.length);
        return;
      }
      const control = inner.querySelector<HTMLElement>('.colox-select__control');
      const trailing = inner.querySelector<HTMLElement>('.colox-select__trailing');
      const innerGap = parseFloat(getComputedStyle(inner).columnGap);
      const gap = Number.isFinite(innerGap) && innerGap >= 0 ? innerGap : 0;
      const controlMin = control === null ? 0 : parseFloat(getComputedStyle(control).minWidth) || 0;
      const controlWidth = control?.offsetWidth ?? 0;
      const trailingWidth = trailing?.offsetWidth ?? 0;

      // The room the row gets with the control parked at its floor. A
      // grown control (typing) already took its share — the current
      // leftover is the real budget then. Both are independent of the
      // slice itself, so the count cannot collapse by feeding on its
      // own layout.
      const reservedControl = controlWidth > controlMin ? controlWidth : controlMin;
      const budget = Math.max(0, innerWidth - reservedControl - trailingWidth - 2 * gap);

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
      // passes where the first two chips sit in flow; once they fold,
      // fall back to the computed gap.
      const first = nodes[0] as HTMLElement | undefined;
      const second = nodes[1] as HTMLElement | undefined;
      if (
        first instanceof HTMLElement &&
        second instanceof HTMLElement &&
        first.style.visibility !== 'hidden' &&
        second.style.visibility !== 'hidden'
      ) {
        gapRef.current = Math.max(0, second.offsetLeft - first.offsetLeft - first.offsetWidth);
      } else {
        const computedGap = parseFloat(getComputedStyle(row).columnGap);
        gapRef.current = Number.isFinite(computedGap) && computedGap >= 0 ? computedGap : 0;
      }
      setVisibleCount(countFittingTags(chipWidths, gapRef.current, budget, badge.offsetWidth));
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(inner);
    observer.observe(row);
    const control = inner.querySelector<HTMLElement>('.colox-select__control');
    if (control !== null) {
      observer.observe(control);
    }
    return () => observer.disconnect();
  }, [values, visibleCount]);

  if (values.length === 0) {
    return null;
  }

  return (
    <div ref={rowRef} className="colox-select__tags">
      {values.map((tagValue, index) => {
        const label = options.find((option) => option.value === tagValue)?.text ?? tagValue;
        const hidden = index >= visibleCount;
        return (
          <span
            key={tagValue}
            className="colox-select__tag"
            aria-hidden={hidden || undefined}
            style={hidden ? HIDDEN : undefined}
          >
            <span className="colox-select__tag-label">{label}</span>
            <button
              type="button"
              className="colox-select__tag-remove"
              aria-label={`Remove ${label}`}
              disabled={disabled}
              onClick={(event) => {
                event.stopPropagation();
                onRemove(tagValue, event);
              }}
            >
              <IconX aria-hidden="true" />
            </button>
          </span>
        );
      })}
      <span
        ref={badgeRef}
        className="colox-select__tag-overflow"
        aria-hidden={folded === 0 || undefined}
        style={folded === 0 ? HIDDEN : undefined}
      >
        +{folded === 0 ? 1 : folded}
      </span>
    </div>
  );
};

SelectTags.displayName = 'SelectTags';
