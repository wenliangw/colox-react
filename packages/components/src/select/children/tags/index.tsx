import { useRef } from 'react';
import type { CSSProperties } from 'react';
import { IconX } from '@colox/icons';
import type { SelectTagsProps } from '../../types';
import { useTagFold } from '../../hooks/use-tag-fold';

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
 * the folded tail is visually sliced (see `useTagFold`) and the +M
 * count chip sits in flow right after the last visible chip, never
 * overlaying anything. Clicking the +M chip bubbles to the shell and
 * opens the panel.
 */
export const SelectTags = ({ values, options, disabled, onRemove }: SelectTagsProps) => {
  const rowRef = useRef<HTMLDivElement>(null);
  const badgeRef = useRef<HTMLSpanElement>(null);
  const { visibleCount } = useTagFold({ values, rowRef, badgeRef });

  const folded = values.length - visibleCount;

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
