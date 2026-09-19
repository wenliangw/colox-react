import type {
  ChangeEventHandler,
  FocusEventHandler,
  KeyboardEvent,
  KeyboardEventHandler,
  RefObject,
} from 'react';
import type { DatePickerChangePayload } from './component';
import type { DatePanelLevel, DatePickerPicker, DateValue, DateViewport } from './utils';

export interface UseDatePickerParams {
  /** The native input this editor drives. */
  inputRef: RefObject<HTMLInputElement | null>;
  /** The panel container — grid cells are focused by DOM id from here. */
  panelRef: RefObject<HTMLDivElement | null>;
  /** The selection granularity (value shape + panel view). */
  picker: DatePickerPicker;
  /** Controlled value (canonical at the picker granularity); `undefined` means uncontrolled. */
  value: DateValue | undefined;
  /** Uncontrolled seed value. */
  defaultValue: DateValue | undefined;
  /** Lower ISO date bound. */
  min: string | undefined;
  /** Upper ISO date bound. */
  max: string | undefined;
  /** Display/parse pattern for the field text. */
  valueFormat: string;
  /** Controlled panel visibility; `undefined` means uncontrolled. */
  open: boolean | undefined;
  /** Uncontrolled initial visibility. */
  defaultOpen: boolean | undefined;
  /** The consumer's onChange — the only commit notification path. */
  onChange: ((payload: DatePickerChangePayload) => void) | undefined;
  /** The consumer's open-state callback. */
  onOpenChange: ((next: boolean) => void) | undefined;
  /** The consumer's native blur handler, appended after bookkeeping. */
  onBlur: FocusEventHandler<HTMLInputElement> | undefined;
  /** The consumer's native key handler, appended after bookkeeping. */
  onKeyDown: KeyboardEventHandler<HTMLInputElement> | undefined;
}

export interface UseDatePickerResult {
  /** The committed value (controlled or internal state). */
  current: DateValue;
  /** The displayed string. */
  draft: string;
  /** Panel visibility. */
  open: boolean;
  /** The displayed grid (panel viewport, discriminated by the picker). */
  view: DateViewport;
  /** The panel's grid level (base = the picker; drilling climbs to 'year'). */
  level: DatePanelLevel;
  /** Panel cell focus anchor (selection, current, or the grid's home). */
  activeIso: string | null;
  handleChange: ChangeEventHandler<HTMLInputElement>;
  handleBlur: FocusEventHandler<HTMLInputElement>;
  /** Input keys: ArrowDown/Enter opens the panel when closed. */
  handleKeyDown: KeyboardEventHandler<HTMLInputElement>;
  openPanel: () => void;
  closePanel: () => void;
  /** Grid cell rotation + Enter/Space selection (pick or descend). */
  handleGridKeyDown: (event: KeyboardEvent<HTMLButtonElement>, iso: string) => void;
  /** Picks a cell: commits at the base level, descends a level above it. */
  handleSelectCell: (iso: string) => void;
  /** Drills to a target level via the header (day grid → month/year). */
  handleTitleClick: (target: DatePanelLevel) => void;
  handleClear: () => void;
  /** Shifts the grid by the single-chevron step (month/year per level). */
  shiftView: (delta: number) => void;
  /** Shifts the grid by the double-chevron step (year/decade per level). */
  shiftDoubleView: (delta: number) => void;
  /** Whether a value is outside `[min, max]`. */
  isDisabled: (iso: string) => boolean;
}
