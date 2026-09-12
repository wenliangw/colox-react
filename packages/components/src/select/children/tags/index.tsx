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
 * overlaying anything. The prefix is measured against the row's live
 * width (countFittingTags) and re-measured on resize, so chips grow
 * back as the row widens; without a layout (server, jsdom) the badge
 * hides and every chip shows.
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
    if (row === null || badge === null) {
      return;
    }
    const measure = () => {
      const width = row.clientWidth;
      if (width <= 0) {
        setVisibleCount(values.length);
        return;
      }
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
      if (first instanceof HTMLElement && second instanceof HTMLElement && visibleCount >= 2) {
        gapRef.current = Math.max(0, second.offsetLeft - first.offsetLeft - first.offsetWidth);
      } else {
        const computedGap = Number.parseFloat(getComputedStyle(row).columnGap);
        gapRef.current = Number.isFinite(computedGap) && computedGap >= 0 ? computedGap : 0;
      }
      setVisibleCount(countFittingTags(chipWidths, gapRef.current, width, badge.offsetWidth));
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(row);
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
