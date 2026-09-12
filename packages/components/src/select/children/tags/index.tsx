import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { IconX } from '@colox/icons';
import type { SelectTagsProps } from '../../types';
import { countFittingTags } from '../../utils/tag-fitting';

// SSR-safe layout measurement: the browser measures before the first
// paint, the server (and jsdom) run it as a plain effect.
const useIsomorphicLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect;

/**
 * Multiple-mode chips: one removable pill per value. The chip label is
 * the member's `text` (the plain-text surface); a value outside the
 * compiled members falls back to the raw value string.
 *
 * The row stays single-line: every chip always renders (the DOM keeps
 * the full selection) and the clipped tail hides behind a +M badge
 * overlaying the row's right end — the badge counts the chips under
 * it. The fit is measured against the row's live width and re-measured
 * on resize; without a layout (server, jsdom) the badge stays hidden
 * and all chips read as visible.
 */
export const SelectTags = ({ values, options, disabled, onRemove }: SelectTagsProps) => {
  const rowRef = useRef<HTMLDivElement>(null);
  const badgeRef = useRef<HTMLSpanElement>(null);
  const [folded, setFolded] = useState(0);

  useIsomorphicLayoutEffect(() => {
    const row = rowRef.current;
    const badge = badgeRef.current;
    if (row === null || badge === null) {
      return;
    }
    const measure = () => {
      const width = row.clientWidth;
      if (width <= 0) {
        setFolded(0);
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
      const first = nodes[0] as HTMLElement | undefined;
      const second = nodes[1] as HTMLElement | undefined;
      const gap =
        first instanceof HTMLElement && second instanceof HTMLElement
          ? Math.max(0, second.offsetLeft - first.offsetLeft - first.offsetWidth)
          : 0;
      setFolded(values.length - countFittingTags(chipWidths, gap, width, badge.offsetWidth));
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(row);
    return () => observer.disconnect();
  }, [values.length, folded]);

  if (values.length === 0) {
    return null;
  }

  return (
    <div ref={rowRef} className="colox-select__tags">
      {values.map((tagValue) => {
        const label = options.find((option) => option.value === tagValue)?.text ?? tagValue;
        return (
          <span key={tagValue} className="colox-select__tag">
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
        aria-hidden={folded === 0}
        style={folded === 0 ? { visibility: 'hidden' } : undefined}
      >
        +{folded === 0 ? 1 : folded}
      </span>
    </div>
  );
};

SelectTags.displayName = 'SelectTags';
