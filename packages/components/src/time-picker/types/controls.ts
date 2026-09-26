import type { KeyboardEvent } from 'react';
import type { TimeColumnUnit } from './utils';

/** The built-in `clearable` control — the host hands over only the site program. */
export interface TimePickerClearButtonProps {
  onClear: () => void;
}

/** The panel assembly contract: two cyclic columns under the hook's window state. */
export interface TimePickerPanelProps {
  /** The hour column's window anchor (unwrapped — wraps at render). */
  hourAnchor: number;
  /** The minute column's window anchor (unwrapped). */
  minuteAnchor: number;
  /** The hour column's keyboard cursor slot (unwrapped). */
  hourCursor: number;
  /** The minute column's keyboard cursor slot (unwrapped). */
  minuteCursor: number;
  /** The committed hour (option value), or null when empty. */
  hourSelected: number | null;
  /** The committed minute (option value), or null when empty. */
  minuteSelected: number | null;
  /** Whether an hour option is out of bounds at the committed minute. */
  isDisabledHour: (hour: number) => boolean;
  /** Whether a minute option is out of bounds at the committed hour. */
  isDisabledMinute: (minute: number) => boolean;
  /** Selects an option: merges it into the value, commits and closes. */
  onSelectOption: (unit: TimeColumnUnit, value: number) => void;
  /** Column keyboard rotation fired from an option button. */
  onColumnKeyDown: (
    event: KeyboardEvent<HTMLButtonElement>,
    unit: TimeColumnUnit,
    value: number,
  ) => void;
  /** Scrolls a column window by the arrow-button step (±7). */
  onScrollColumn: (unit: TimeColumnUnit, delta: number) => void;
}

/** One cyclic column: the up/down step buttons around the 8-option listbox. */
export interface TimePickerColumnProps {
  /** Which clock component the column holds. */
  unit: TimeColumnUnit;
  /** The listbox aria label ("Hours" / "Minutes"). */
  label: string;
  /** The window anchor (unwrapped — options wrap at render). */
  anchor: number;
  /** The keyboard cursor slot (unwrapped — the tabIndex-0 option). */
  cursor: number;
  /** The cycle size (24 hours / 60 minutes). */
  count: number;
  /** The committed option value, or null when empty. */
  selected: number | null;
  /** Whether an option value is out of bounds. */
  isDisabled: (value: number) => boolean;
  /** Picks an option (merge + commit + close). */
  onSelect: (value: number) => void;
  /** Keyboard rotation fired from an option button. */
  onKeyDown: (event: KeyboardEvent<HTMLButtonElement>, value: number) => void;
  /** Scrolls the window by ±7 (the step buttons). */
  onScroll: (delta: number) => void;
}
