export type {
  DateFormatPart,
  DateFormatToken,
  DateParts,
  IsoPrecision,
  MonthGridCell,
  MonthViewCell,
  YearViewCell,
} from '../../cdk/date/types';

/** The granularity the field edits: a single day, a month, or a year. */
export type DatePickerPicker = 'date' | 'month' | 'year';

/**
 * The panel's grid level — the cell vocabulary the grid renders.
 * The base level equals the picker; drilling steps above it via the
 * clickable header (day grid → month grid → decade grid), and cell
 * picks descend back to the base level when they are coarser than
 * the value granularity. The vocabulary intentionally matches the
 * picker: a month grid shows month cells whether the field commits
 * months or only drills through them.
 */
export type DatePanelLevel = DatePickerPicker;

/**
 * The date value word: a canonical granularity ISO string —
 * `YYYY-MM-DD` (date), `YYYY-MM` (month) or `YYYY` (year) — or the
 * empty state `null`. Weekday/month names and display formatting live
 * in the format layer; this is the raw value contract.
 */
export type DateValue = string | null;

/**
 * The panel viewport, discriminated by what the picker shows:
 * a calendar month, a year of months, or a 12-year decade window.
 */
export type DateViewport =
  | { picker: 'date'; year: number; month: number }
  | { picker: 'month'; year: number }
  | { picker: 'year'; decadeStart: number };

/**
 * One panel grid cell ready for paint: the canonical ISO id plus
 * the display label. `inView` stays undefined unless the cell is an
 * adjacent-month fill on the day grid (dimmed but selectable).
 */
export interface DatePickerGridCell {
  iso: string;
  label: string;
  inView?: boolean;
}
