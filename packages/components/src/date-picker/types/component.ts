import type { ChangeEvent, InputHTMLAttributes } from 'react';
import type { DatePickerVariants } from '../variants';
import type { DatePickerPicker } from './utils';

export type DatePickerSize = NonNullable<DatePickerVariants['size']>;
export type DatePickerPalette = NonNullable<DatePickerVariants['palette']>;

/**
 * Panel chrome localization: the built-in calendar chrome (month
 * header labels, weekday row, title composition) is data — every
 * field is optional and falls back to the Chinese panel defaults
 * (`2026年3月`, weekdays `一…日`). Data-only, no render callbacks.
 */
export interface DatePickerLocale {
  /** 12 month labels for the header and the month view, January first. */
  months?: string[];
  /** 7 weekday header labels, Monday first. */
  weekdays?: string[];
  /** Day-view title pattern — `{year}` and `{month}` mount the year
   * and the month label. */
  yearMonthFormat?: string;
  /** Month-view title pattern — `{year}` mounts the displayed year. */
  yearFormat?: string;
  /** Year-view title pattern — `{start}` and `{end}` mount the decade
   * window edges. */
  decadeFormat?: string;
}

/** The locale with every field resolved (internal panel contract). */
export interface ResolvedDatePickerLocale {
  months: string[];
  weekdays: string[];
  yearMonthFormat: string;
  yearFormat: string;
  decadeFormat: string;
}

export interface DatePickerProps extends Omit<
  InputHTMLAttributes<HTMLInputElement>,
  'size' | 'type' | 'value' | 'defaultValue' | 'onChange' | 'min' | 'max'
> {
  /**
   * Visual size of the field: same-name tiers share the family row
   * heights (24/32/40/48) and the leading padding ladder.
   * @default 'md'
   */
  size?: DatePickerSize;
  /**
   * Marks the field as invalid (red border/ring + `aria-invalid`).
   * @default false
   */
  invalid?: boolean;
  /**
   * The palette family that colors the selection semantics: the
   * selected cell fills the family solid, the current cell (today,
   * the current month, the current year) wears the family subtle
   * wash (hover deepens to the muted pair) for as long as it is not
   * selected — the moment it is, subtle yields and solid fills it
   * (off-state fabric stays neutral; the Switch/Slider "only paint
   * the active state" discipline).
   * @default 'primary'
   */
  palette?: DatePickerPalette;
  /**
   * The selection granularity: `date` picks a day from the month
   * grid, `month` picks a month from the 12-month grid, `year`
   * picks a year from the 12-year decade window. The canonical
   * value shape follows the picker (`YYYY-MM-DD` / `YYYY-MM` /
   * `YYYY`) — see `value`/`valueFormat`.
   * @default 'date'
   */
  picker?: DatePickerPicker;
  /**
   * The selected value, canonical at the picker granularity
   * (`YYYY-MM-DD`, `YYYY-MM` or `YYYY`). `null` is the empty state.
   * Without `value` the field is uncontrolled: `defaultValue` seeds
   * it.
   */
  value?: string | null;
  /**
   * Uncontrolled initial value (canonical at the picker granularity).
   * @default null
   */
  defaultValue?: string | null;
  /**
   * Lower bound (canonical ISO date): out-of-range cells render
   * disabled, typed values roll back on blur. Month/year cells
   * compare their granularity prefix against the bound.
   */
  min?: string;
  /**
   * Upper bound (canonical ISO date, same mechanics as `min`).
   */
  max?: string;
  /**
   * The display format: standard date-pattern tokens — `yyyy`/`yy`,
   * `M`/`MM`, `d`/`dd`, and weekday `EEE`/`EEEE` (display-only, never
   * parsed). Letters are case-insensitive, any other character is a
   * literal separator. The internal value and the change payload stay
   * canonical at the picker granularity regardless of the format.
   * @default per picker: 'yyyy-MM-dd' | 'yyyy-MM' | 'yyyy'
   */
  valueFormat?: string;
  /**
   * Panel chrome localization: override the month header labels,
   * weekday row and title composition (data-only, no callbacks).
   * Defaults are Chinese (`2026年3月`, weekdays `一…日`).
   */
  locale?: DatePickerLocale;
  /**
   * Shows the trailing ✕ clear control when a value commits — the
   * Select interaction: it swaps in for the calendar glyph on
   * hover/focus and commits `null` through the change payload.
   * @default false
   */
  clearable?: boolean;
  /**
   * Whether the calendar panel is open. Without `open` the panel
   * follows its own state (see `defaultOpen`).
   */
  open?: boolean;
  /**
   * Initial panel state when uncontrolled.
   * @default false
   */
  defaultOpen?: boolean;
  /**
   * Fires whenever a complete date commits: the payload carries the
   * native change event plus the canonical ISO value (`null` when
   * cleared). Partial drafts never notify; blur rolls invalid or
   * out-of-bounds drafts back to the committed value.
   */
  onChange?: (payload: DatePickerChangePayload) => void;
  /**
   * Fires when the calendar panel opens or closes.
   */
  onOpenChange?: (open: boolean) => void;
}

/**
 * The date commit payload: `event` stays the native change event
 * (a change-shaped synthetic for programmatic commits — panel
 * selection and Clear), `value` is the canonical ISO date already
 * parsed — `null` when the field is empty.
 */
export interface DatePickerChangePayload {
  event: ChangeEvent<HTMLInputElement>;
  value: string | null;
}

export type DatePickerRef = HTMLInputElement;
