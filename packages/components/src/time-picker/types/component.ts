import type { ChangeEvent, InputHTMLAttributes } from 'react';
import type { TimePickerVariants } from '../variants';

export type TimePickerSize = NonNullable<TimePickerVariants['size']>;
export type TimePickerPalette = NonNullable<TimePickerVariants['palette']>;

export interface TimePickerProps extends Omit<
  InputHTMLAttributes<HTMLInputElement>,
  'size' | 'type' | 'value' | 'defaultValue' | 'onChange' | 'min' | 'max'
> {
  /**
   * Visual size of the field: same-name tiers share the family row
   * heights (24/32/40/48) and the leading padding ladder.
   * @default 'md'
   */
  size?: TimePickerSize;
  /**
   * Marks the field as invalid (red border/ring + `aria-invalid`).
   * @default false
   */
  invalid?: boolean;
  /**
   * The palette family that colors the selection semantics: the
   * pending option wears the family subtle wash, the keyboard focus
   * ring rides the muted pair (off-state fabric stays neutral — the
   * Switch/Slider "only paint the active state" discipline).
   * @default 'primary'
   */
  palette?: TimePickerPalette;
  /**
   * The selected value as the canonical `HH:mm:ss` word — fixed
   * width, zero padded, so lexical order equals time order. `null`
   * is the empty state. Without `value` the field is uncontrolled:
   * `defaultValue` seeds it.
   */
  value?: string | null;
  /**
   * Uncontrolled initial value (canonical `HH:mm:ss`).
   * @default null
   */
  defaultValue?: string | null;
  /**
   * Lower bound: the canonical `HH:mm:ss` word or a native `Date`
   * read at the local wall clock (hour + minute + second).
   * Out-of-range options render disabled, typed values hold silently
   * until blur rolls them back — the same editor mechanics as the
   * DatePicker.
   */
  min?: string | Date;
  /** Upper bound (same mechanics as `min`). */
  max?: string | Date;
  /**
   * The display format: hour tokens `H`/`HH` (plus `h`/`hh`) and
   * minute `m`/`mm` plus second `s`/`ss` — any other character is a
   * literal separator. The internal value and the change payload
   * stay canonical (`HH:mm:ss`) regardless of the format.
   * @default 'HH:mm:ss'
   */
  valueFormat?: string;
  /**
   * The panel footer's confirm button text — the one customization
   * point of the footer for now (a whole-footer slot stays out until
   * a real consumer exists; i18n machinery comes with the locale
   * request, not before). The rest of the panel chrome is Chinese by
   * default, so the button follows.
   * @default '确定'
   */
  confirmText?: string;
  /**
   * Shows the trailing ✕ clear control when a value commits — the
   * Select interaction: it swaps in for the clock glyph on
   * hover/focus and commits `null` through the change payload.
   * @default false
   */
  clearable?: boolean;
  /**
   * Whether the time panel is open. Without `open` the panel
   * follows its own state (see `defaultOpen`).
   */
  open?: boolean;
  /**
   * Initial panel state when uncontrolled.
   * @default false
   */
  defaultOpen?: boolean;
  /**
   * Fires whenever a complete time commits — typed, or confirmed
   * from the panel: the payload carries the native change event plus
   * the canonical `HH:mm:ss` value (`null` when cleared). Picks
   * inside the panel only preview (the field shows the tentative
   * word in gray) until the panel's confirm button commits them.
   */
  onChange?: (payload: TimePickerChangePayload) => void;
  /** Fires when the time panel opens or closes. */
  onOpenChange?: (open: boolean) => void;
}

/**
 * The time commit payload: `event` stays the native change event
 * (a change-shaped synthetic for programmatic commits — panel
 * confirmation and Clear), `value` is the canonical `HH:mm:ss` word —
 * `null` when the field is empty.
 */
export interface TimePickerChangePayload {
  event: ChangeEvent<HTMLInputElement>;
  value: string | null;
}

export type TimePickerRef = HTMLInputElement;
