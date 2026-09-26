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
   * selected option fills the family solid, the keyboard focus ring
   * rides the muted pair (off-state fabric stays neutral — the
   * Switch/Slider "only paint the active state" discipline).
   * @default 'primary'
   */
  palette?: TimePickerPalette;
  /**
   * The selected value as the canonical `HH:mm` word — fixed width,
   * zero padded, so lexical order equals time order. `null` is the
   * empty state. Without `value` the field is uncontrolled:
   * `defaultValue` seeds it.
   */
  value?: string | null;
  /**
   * Uncontrolled initial value (canonical `HH:mm`).
   * @default null
   */
  defaultValue?: string | null;
  /**
   * Lower bound: the canonical `HH:mm` word or a native `Date` read
   * at the local wall clock (hour + minute). Out-of-range options
   * render disabled, typed values hold silently until blur rolls
   * them back — the same editor mechanics as the DatePicker.
   */
  min?: string | Date;
  /** Upper bound (same mechanics as `min`). */
  max?: string | Date;
  /**
   * The display format: hour tokens `H`/`HH` (plus `h`/`hh`) and
   * minute `m`/`mm` — any other character is a literal separator.
   * The internal value and the change payload stay canonical
   * (`HH:mm`) regardless of the format.
   * @default 'HH:mm'
   */
  valueFormat?: string;
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
   * Fires whenever a complete time commits — typed or picked: the
   * payload carries the native change event plus the canonical
   * `HH:mm` value (`null` when cleared). Partial drafts never
   * notify; blur rolls invalid or out-of-bounds drafts back.
   */
  onChange?: (payload: TimePickerChangePayload) => void;
  /** Fires when the time panel opens or closes. */
  onOpenChange?: (open: boolean) => void;
}

/**
 * The time commit payload: `event` stays the native change event
 * (a change-shaped synthetic for programmatic commits — panel
 * selection and Clear), `value` is the canonical `HH:mm` word —
 * `null` when the field is empty.
 */
export interface TimePickerChangePayload {
  event: ChangeEvent<HTMLInputElement>;
  value: string | null;
}

export type TimePickerRef = HTMLInputElement;
