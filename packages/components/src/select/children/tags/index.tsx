import { cloneElement, useRef } from 'react';
import type { CSSProperties, JSX } from 'react';
import { IconX } from '@colox/icons';
import type {
  SelectChangeEvent,
  SelectOptionRecord,
  SelectTagsProps,
  SelectTagRequiredProps,
} from '../../types';
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
 *
 * Two render channels: the default pill (no template) and the
 * template channel — the captured `Select.Template('tag')` component
 * is cloned per chip with the injected contract `{ props, option,
 * onRemove }`. `props` is the required-attribute bag carrying the
 * fold channel (`aria-hidden` + hidden style past the slice; the
 * author contract ist `{...props}` first on their root); the fold
 * measurement treats the cloned roots as the row children, so custom
 * chips fold and grow back exactly like the defaults. The custom
 * root must be a single element — one row child per value.
 */
export const SelectTags = ({
  values,
  options,
  disabled,
  tagTemplate,
  fallbackSize,
  onRemove,
}: SelectTagsProps) => {
  const rowRef = useRef<HTMLDivElement>(null);
  const badgeRef = useRef<HTMLSpanElement>(null);
  const { visibleCount } = useTagFold({ values, rowRef, badgeRef });

  const folded = values.length - visibleCount;

  if (values.length === 0) {
    return null;
  }

  // The member record per value; unknown values synthesize a raw
  // fallback record so the injected `option` is always defined.
  const resolveRecord = (tagValue: string): SelectOptionRecord =>
    options.find((option) => option.value === tagValue) ?? {
      value: tagValue,
      text: tagValue,
      disabled: false,
      size: fallbackSize,
      key: tagValue,
      content: tagValue,
    };

  // The fold channel as the injectable bag.
  const bagFor = (hidden: boolean): SelectTagRequiredProps =>
    hidden ? { 'aria-hidden': true, style: HIDDEN } : {};

  return (
    <div ref={rowRef} className="colox-select__tags">
      {values.map((tagValue, index) => {
        const option = resolveRecord(tagValue);
        const hidden = index >= visibleCount;

        if (tagTemplate === null) {
          return (
            <span
              key={tagValue}
              className="colox-select__tag"
              aria-hidden={hidden || undefined}
              style={hidden ? HIDDEN : undefined}
            >
              <span className="colox-select__tag-label">{option.text}</span>
              <button
                type="button"
                className="colox-select__tag-remove"
                aria-label={`Remove ${option.text}`}
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
        }

        // The template channel: clone the captured component, inject
        // the slot contract (the injected keys own the namespace —
        // the author's own props pass through untouched).
        return cloneElement(tagTemplate as JSX.Element, {
          key: tagValue,
          props: bagFor(hidden),
          option,
          onRemove: (event: SelectChangeEvent) => {
            event.stopPropagation();
            onRemove(tagValue, event);
          },
        });
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
