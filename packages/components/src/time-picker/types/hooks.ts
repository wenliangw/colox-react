import type {
  ChangeEventHandler,
  FocusEventHandler,
  KeyboardEvent,
  KeyboardEventHandler,
  RefObject,
} from 'react';
import type { TimePickerChangePayload } from './component';
import type { TimeColumnUnit } from './utils';

export interface UseTimePickerParams {
  /** The native input this editor drives. */
  inputRef: RefObject<HTMLInputElement | null>;
  /** The panel container — options are focused by DOM query from here. */
  panelRef: RefObject<HTMLDivElement | null>;
  /** Controlled value (canonical `HH:mm:ss`); `undefined` means uncontrolled. */
  value: string | null | undefined;
  /** Uncontrolled seed value. */
  defaultValue: string | null | undefined;
  /** Lower bound ('HH:mm:ss' word or Date read at the local wall clock). */
  min: string | Date | undefined;
  /** Upper bound. */
  max: string | Date | undefined;
  /** Display/parse pattern for the field text. */
  valueFormat: string;
  /** Controlled panel visibility; `undefined` means uncontrolled. */
  open: boolean | undefined;
  /** Uncontrolled initial visibility. */
  defaultOpen: boolean | undefined;
  /** The consumer's onChange — the only commit notification path. */
  onChange: ((payload: TimePickerChangePayload) => void) | undefined;
  /** The consumer's open-state callback. */
  onOpenChange: ((next: boolean) => void) | undefined;
  /** The consumer's native blur handler, appended after bookkeeping. */
  onBlur: FocusEventHandler<HTMLInputElement> | undefined;
  /** The consumer's native key handler, appended after bookkeeping. */
  onKeyDown: KeyboardEventHandler<HTMLInputElement> | undefined;
}

export interface UseTimePickerResult {
  /** The committed value (controlled or internal state). */
  current: string | null;
  /** The committed value rendered through `valueFormat`. */
  currentText: string;
  /** Panel visibility. */
  open: boolean;
  /** Column values (plain clock components within their cycles). */
  hourValue: number;
  minuteValue: number;
  secondValue: number;
  /** The pending hour (option value): committed parts when untouched, the system clock on an empty open — null only after a re-seat cleared a pick. */
  hourSelected: number | null;
  /** The pending minute. */
  minuteSelected: number | null;
  /** The pending second. */
  secondSelected: number | null;
  /** The input's displayed string (the typed draft, the pending preview, or the committed word). */
  display: string;
  /** Whether the input shows an uncommitted pick — the gray preview styling flag. */
  preview: boolean;
  /** Whether the pending word sits out of bounds (confirm disabled). */
  confirmBlocked: boolean;
  handleChange: ChangeEventHandler<HTMLInputElement>;
  handleBlur: FocusEventHandler<HTMLInputElement>;
  /** Input keys: ArrowDown/Enter opens the panel when closed. */
  handleKeyDown: KeyboardEventHandler<HTMLInputElement>;
  openPanel: () => void;
  closePanel: () => void;
  /** Commits the pending word, closes the panel and returns focus to the field. */
  handleConfirm: () => void;
  handleClear: () => void;
  /** Lands a column on an option value: updates the pending word, panel stays open. */
  handleSelectOption: (unit: TimeColumnUnit, value: number) => void;
  /** Column keyboard rotation (↑↓/PgUp/PgDn/Home/End/←→). */
  handleColumnKeyDown: (event: KeyboardEvent<HTMLButtonElement>, unit: TimeColumnUnit) => void;
  /** Moves a column by a relative step (chevrons ±7, keyboard ±1/±7). */
  moveColumn: (unit: TimeColumnUnit, delta: number) => void;
  /** Whether a canonical `HH:mm:ss` word is outside `[min, max]`. */
  isDisabled: (word: string) => boolean;
  /** Whether an option value's merge with the pending anchor falls out of bounds (any unit). */
  isDisabledOption: (unit: TimeColumnUnit, value: number) => boolean;
}
