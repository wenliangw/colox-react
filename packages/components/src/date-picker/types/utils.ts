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

/** Calendar coordinates: the 1-based month as users write it (1–12). */
export interface DateParts {
  year: number;
  month: number;
  day: number;
}

/** One cell of the 42-cell (6×7) month grid. */
export interface MonthGridCell {
  /** The cell's canonical ISO date (adjacent-month fill included). */
  iso: string;
  /** Day-of-month number for the rendered label. */
  day: number;
  /** Whether the cell belongs to the displayed month. */
  inMonth: boolean;
}

/** One cell of the month view (the 12 months of a year). */
export interface MonthViewCell {
  /** Canonical month value (`YYYY-MM`). */
  iso: string;
  /** 1-based month number (1–12). */
  month: number;
}

/** One cell of the year view (the 12-year decade window). */
export interface YearViewCell {
  /** Canonical year value (`YYYY`). */
  iso: string;
  /** The year rendered (decadeStart … decadeStart+11). */
  year: number;
}

/**
 * The typed-text parse precision: how far a string pins the civil
 * date — year only, year+month, or a full date. A draft commits only
 * when its precision reaches the picker's granularity (typing more
 * precision than the picker provides is accepted and truncated).
 */
export type IsoPrecision = 0 | 1 | 2;

/** One compiled piece of a `valueFormat` pattern. */
export type DateFormatPart =
  | { type: 'year' | 'month' | 'day' | 'weekday'; length: number }
  | { type: 'literal'; text: string };

/** One compiled token of a `valueFormat` pattern. */
export type DateFormatToken = Extract<DateFormatPart, { length: number }>;

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
