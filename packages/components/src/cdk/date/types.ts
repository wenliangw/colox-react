/**
 * The shared date/time vocabulary of the cdk date core. These are the
 * structural words every consumer (the date picker today, the time
 * picker and the datetime surface next) speaks — no component state
 * ever enters this layer.
 */

/** The granularity a date-ish field edits: a single day, a month, or a year. */
export type DateGranularity = 'date' | 'month' | 'year';

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
 * when its precision reaches the field's granularity (typing more
 * precision than the field provides is accepted and truncated).
 */
export type ParsePrecision = 0 | 1 | 2;

/** One compiled piece of a `valueFormat` pattern. */
export type DateFormatPart =
  | { type: 'year' | 'month' | 'day' | 'weekday'; length: number }
  | { type: 'literal'; text: string };

/** One compiled token of a `valueFormat` pattern. */
export type DateFormatToken = Extract<DateFormatPart, { length: number }>;
