import type { DateParts } from './calendar';

/**
 * The plain-object coordinate (the parts format): what `.parts()` and
 * `dateParts()` emit and what the `date` factory reads back — the full
 * civil+clock coordinate, calendar- and clock-validated. The day-only
 * `DateParts` shape the calendar math speaks is also accepted as input.
 */
export interface DateTimeParts {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  second: number;
}

/** What `date`, `dateParts` and `format` accept: value strings, native Dates, an instance or the parts format. */
export type DateSource = string | Date | ColoxDate | DateParts | DateTimeParts;

/**
 * What the pure toolbelt reads: value strings, native `Date`, or the
 * plain parts formats — the chain instance is retired from the input
 * vocabulary.
 */
export type DateValue = string | Date | DateParts | DateTimeParts;

/**
 * The full coordinate `dateParts` emits: the six calendar- and
 * clock-validated fields plus `weekday` (Monday-first index,
 * `0 = Monday … 6 = Sunday`).
 */
export type DatePartsFull = DateTimeParts & { weekday: number };

/**
 * The immutable date/time coordinate the `date` factory produces.
 * Construction lives entirely behind the factory: the public face is
 * this method set — no constructor, no internal entries.
 */
export interface ColoxDate {
  /** Whole-day shift; the clock part rides along untouched. */
  addDays(delta: number): ColoxDate;

  /** Whole-month shift, clamping the day into the target month; the clock rides along. */
  addMonths(delta: number): ColoxDate;

  /** Whole-year shift, clamping Feb 29 into Feb 28 on common years; the clock rides along. */
  addYears(delta: number): ColoxDate;

  /** Renders through the token pattern (see the module vocabulary). */
  format(pattern: string): string;

  /**
   * The instant word — the value shifted to UTC and serialized
   * exactly like `new Date().toISOString()`: full clock, milliseconds
   * and `Z` (e.g. `'2026-03-15T00:30:00.000Z'`). This is the wire/
   * interchange shape; display and value rendering stay in `format`.
   */
  iso(): string;

  /** The plain-object coordinate (`DateTimeParts`): the parts format `date()` reads back. */
  parts(): DateTimeParts;

  /** The native Date at the browser-local calendar wall clock. */
  toDate(): Date;
}
