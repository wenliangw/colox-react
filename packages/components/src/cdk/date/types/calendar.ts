/** The granularity a date-ish field edits: a single day, a month, or a year. */
export type DateGranularity = 'date' | 'month' | 'year';

/**
 * The boundaries `dateStartOf`/`dateEndOf` walk: week granularity is
 * Monday-first (a week starts on Monday). Unlike `DateGranularity`
 * (the picker's edit granularity), this ladder covers the clock down
 * to the whole second.
 */
export type Granularity = 'year' | 'month' | 'week' | 'day' | 'hour' | 'minute' | 'second';

/** The units `dateDiff` measures — calendar truth down to the whole second (week is deliberately absent). */
export type DiffUnit = 'year' | 'month' | 'day' | 'hour' | 'minute' | 'second';

/**
 * A measured difference: `count` handfuls of the requested unit plus
 * the honest residue in the next-lower unit — year/month residues in
 * days, day in hours, hour in minutes, minute in seconds; seconds
 * are the floor, so the second unit leaves remainder 0.
 */
export interface DiffResult {
  count: number;
  remainder: number;
}

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
