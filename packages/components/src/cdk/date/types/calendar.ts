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
