import type { DateParts } from './calendar';

/**
 * The plain-object coordinate (the parts format): what `dateParts()`
 * emits (minus `weekday`) and what every toolbelt entry reads back —
 * the full civil+clock coordinate, calendar- and clock-validated.
 * The day-only `DateParts` shape the calendar math speaks is also
 * accepted as input.
 */
export interface DateTimeParts {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  second: number;
}

/**
 * What the pure toolbelt reads: value strings, native `Date` (read
 * at the local wall clock), or the plain parts formats.
 */
export type DateValue = string | Date | DateParts | DateTimeParts;

/**
 * The full coordinate `dateParts` emits: the six calendar- and
 * clock-validated fields plus `weekday` (Monday-first index,
 * `0 = Monday … 6 = Sunday`).
 */
export type DatePartsFull = DateTimeParts & { weekday: number };
