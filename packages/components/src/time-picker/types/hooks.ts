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
  /** Controlled value (canonical `HH:mm`); `undefined` means uncontrolled. */
  value: string | null | undefined;
  /** Uncontrolled seed value. */
  defaultValue: string | null | undefined;
  /** Lower bound ('HH:mm' word or Date read at the local wall clock). */
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
  /** The displayed string. */
  draft: string;
  /** Panel visibility. */
  open: boolean;
  /** The hour column window anchor (unwrapped). */
  hourAnchor: number;
  /** The minute column window anchor (unwrapped). */
  minuteAnchor: number;
  /** The hour column keyboard cursor (unwrapped). */
  hourCursor: number;
  /** The minute column keyboard cursor (unwrapped). */
  minuteCursor: number;
  /** The committed hour, or null when the value is empty. */
  hourSelected: number | null;
  /** The committed minute, or null when the value is empty. */
  minuteSelected: number | null;
  handleChange: ChangeEventHandler<HTMLInputElement>;
  handleBlur: FocusEventHandler<HTMLInputElement>;
  /** Input keys: ArrowDown/Enter opens the panel when closed. */
  handleKeyDown: KeyboardEventHandler<HTMLInputElement>;
  openPanel: () => void;
  closePanel: () => void;
  handleClear: () => void;
  /** Selects an option: merges it into the value, commits and closes. */
  handleSelectOption: (unit: TimeColumnUnit, value: number) => void;
  /** Column keyboard rotation (↑↓/PgUp/PgDn/Home/End/←→/Enter). */
  handleColumnKeyDown: (
    event: KeyboardEvent<HTMLButtonElement>,
    unit: TimeColumnUnit,
    value: number,
  ) => void;
  /** Scrolls a column window by the arrow-button step (±7). */
  scrollColumn: (unit: TimeColumnUnit, delta: number) => void;
  /** Whether a canonical `HH:mm` word is outside `[min, max]`. */
  isDisabled: (word: string) => boolean;
  /** Whether an hour option is out of bounds at the committed minute. */
  isDisabledHour: (hour: number) => boolean;
  /** Whether a minute option is out of bounds at the committed hour. */
  isDisabledMinute: (minute: number) => boolean;
}
