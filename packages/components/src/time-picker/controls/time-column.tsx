import type { KeyboardEvent } from 'react';
import clsx from 'clsx';
import { IconChevronDown, IconChevronUp } from '@colox/icons';
import type { TimePickerColumnProps } from '../types';
import { COLUMN_VISIBLE } from '../utils/format';

/**
 * One cyclic column: the up/down step chevrons (window shifts by the
 * 7-option step) around an 8-option listbox. The window is the
 * unwrapped `anchor..anchor+7` run — options render `mod count`, so a
 * window near the cycle edge paints the wrap naturally (no scrollbar,
 * the chevrons are the scroll). The keyboard cursor (the tabIndex-0
 * option) lives at the unwrapped slot; the committed option wears the
 * palette solid; out-of-bounds options are disabled.
 */
export const TimePickerColumn = ({
  unit,
  label,
  anchor,
  cursor,
  count,
  selected,
  isDisabled,
  onSelect,
  onKeyDown,
  onScroll,
}: TimePickerColumnProps) => {
  const direction = unit === 'hour' ? 'hours' : 'minutes';
  return (
    <div className="colox-time-picker__column">
      <button
        type="button"
        tabIndex={-1}
        className="colox-time-picker__step"
        aria-label={`Previous ${direction}`}
        onClick={() => onScroll(-1)}
      >
        <IconChevronUp />
      </button>
      <div
        className="colox-time-picker__listbox"
        role="listbox"
        aria-label={label}
        data-unit={unit}
      >
        {Array.from({ length: COLUMN_VISIBLE }, (_, index) => anchor + index).map((offset) => {
          const value = ((offset % count) + count) % count;
          const disabled = isDisabled(value);
          return (
            <button
              key={offset}
              type="button"
              role="option"
              data-time={value}
              tabIndex={offset === cursor ? 0 : -1}
              className={clsx('colox-time-picker__option', {
                'colox-time-picker__option--selected': value === selected,
                'colox-time-picker__option--disabled': disabled,
              })}
              aria-selected={value === selected}
              aria-disabled={disabled || undefined}
              disabled={disabled}
              onClick={() => onSelect(value)}
              onKeyDown={(event: KeyboardEvent<HTMLButtonElement>) => onKeyDown(event, value)}
            >
              {String(value).padStart(2, '0')}
            </button>
          );
        })}
      </div>
      <button
        type="button"
        tabIndex={-1}
        className="colox-time-picker__step"
        aria-label={`Next ${direction}`}
        onClick={() => onScroll(1)}
      >
        <IconChevronDown />
      </button>
    </div>
  );
};
