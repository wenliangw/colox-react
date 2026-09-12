import { IconX } from '@colox/icons';
import type { SelectTagsProps } from '../../types';

/**
 * Multiple-mode chips: one removable pill per value. The chip label is
 * the member's `text` (the plain-text surface); a value outside the
 * compiled members falls back to the raw value string.
 */
export const SelectTags = ({ values, options, disabled, onRemove }: SelectTagsProps) => {
  if (values.length === 0) {
    return null;
  }
  return (
    <>
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
    </>
  );
};

SelectTags.displayName = 'SelectTags';
