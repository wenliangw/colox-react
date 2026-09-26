import type { KeyboardEvent } from 'react';
import type { TimeColumnUnit } from './utils';

/** The built-in `clearable` control — the host hands over only the site program. */
export interface TimePickerClearButtonProps {
  onClear: () => void;
}

/** The panel assembly contract: three cyclic columns plus the confirm footer. */
export interface TimePickerPanelProps {
  /** Column values (plain clock components within their cycles). */
  hourValue: number;
  minuteValue: number;
  secondValue: number;
  /** The pending hour (option value): committed parts when untouched, the system clock on an empty open. */
  hourSelected: number | null;
  /** The pending minute. */
  minuteSelected: number | null;
  /** The pending second. */
  secondSelected: number | null;
  /** The confirm button text (the footer's single customization point). */
  confirmText: string;
  /** Whether the pending word sits out of bounds (confirm disabled). */
  confirmBlocked: boolean;
  /** Whether an option value's merge with the pending anchor falls out of bounds (any unit). */
  isDisabledOption: (unit: TimeColumnUnit, value: number) => boolean;
  /** Lands a column on an option value (click): updates the pending word, panel stays open. */
  onSelectOption: (unit: TimeColumnUnit, value: number) => void;
  /** Moves a column by a relative step (chevrons ±7). */
  onScrollColumn: (unit: TimeColumnUnit, delta: number) => void;
  /** Column keyboard rotation fired from an option button. */
  onColumnKeyDown: (event: KeyboardEvent<HTMLButtonElement>, unit: TimeColumnUnit) => void;
  /** Commits the pending word, closes the panel and returns focus to the field. */
  onConfirm: () => void;
}

/** One cyclic column: step buttons around a scrollable 8-option viewport (no scrollbar). */
export interface TimePickerColumnProps {
  /** Which clock component the column holds. */
  unit: TimeColumnUnit;
  /** The listbox aria label ("Hours" / "Minutes" / "Seconds"). */
  label: string;
  /** The cycle size (24 hours / 60 minutes / 60 seconds). */
  count: number;
  /**
   * The value the column points at: whenever it changes the column
   * glides it onto the focus slot (three options above, four below;
   * free wheel scrolling may leave the view elsewhere, a re-align
   * glide always lands the value there) — options render `mod count`
   * for the cyclic wrap.
   */
  value: number;
  /** The pending option value (mod count) wearing the subtle selection; null after a re-seat cleared a pick. */
  selected: number | null;
  /** Whether an option value's merge with the pending word is out of bounds. */
  isDisabled: (value: number) => boolean;
  /** Lands the column on an option value (click/keyboard Enter). */
  onSelect: (value: number) => void;
  /** Moves the column by a relative step (chevron clicks ±7). */
  onScroll: (delta: number) => void;
  /** Keyboard rotation fired from an option button (the unit rides in the closure). */
  onKeyDown: (event: KeyboardEvent<HTMLButtonElement>) => void;
}
