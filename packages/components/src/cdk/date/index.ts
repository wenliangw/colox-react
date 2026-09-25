/**
 * `@colox/react/cdk/date` — the public date/time toolbelt.
 *
 * A pure-function capability suite over one immutable notion of a
 * date: every entry accepts `string` (datetime, date, `YYYY-MM`,
 * bare `YYYY`, and the `…Z` instant word spellings), native `Date`
 * (read at the local wall clock) or the parts formats, and its
 * math keeps the zero-timezone civil coordinates all the way
 * through. There is no chained instance to hold — the functions
 * are the surface:
 *
 * ```ts
 * import {
 *   dateFormat, dateParts, dateDiff, addDays, addMonths, today,
 *   dateStartOf, dateEndOf, dateTimestamp, DATEID, secondsToDays,
 * } from '@colox/react/cdk/date';
 *
 * dateFormat('2026-03-15T08:30', 'yyyy-MM-dd');      // '2026-03-15'
 * dateParts('2026/3/2');                      // { year, month, day, hour, minute, second, weekday }
 * dateDiff('2026-03-10', '2023-01-05', 'year');      // { count: 3, remainder: 64 }
 * addDays('2026-02-27', 2);                   // { year: 2026, month: 2, day: 29, … }
 * dateStartOf('2026-03-10', 'week');                 // the preceding Monday midnight
 * dateTimestamp('1970-01-01T00:00');                 // local-midnight epoch millis
 * DATEID();                                   // '1769…0000' — 17-digit numeric id
 * secondsToDays(129600);                      // 1.5
 * ```
 *
 * Contracts: `dateFormat` is the display outlet and never throws —
 * garbage renders `null`; the computation entries (`dateParts`
 * without a fallback, the `add*` family, `dateDiff`, `dateStartOf`/
 * `dateEndOf`, `dateTimestamp`) report garbage honestly with a
 * `TypeError`.
 */
import {
  addMonths as shiftMonths,
  addYears as shiftYears,
  diffOf,
  endOf,
  shiftSeconds,
  startOf,
  weekdayOf,
} from './calendar';
import type { DiffUnit, Granularity } from './calendar';
import { parseSource, toParts } from './parse';
import { renderPattern } from './format';
import type { DateParts, DatePartsFull, DateValue, DateTimeParts } from './types';

export type {
  DateFormatPart,
  DateParts,
  DatePartsFull,
  DateTimeParts,
  DateValue,
  ParsePrecision,
} from './types';
export type { DiffUnit, Granularity } from './calendar';

// ——— rendering ————————————————————————————————————————————————————————

/**
 * The display renderer: coordinates through the token pattern
 * (`y`/`M`/`d`/`E`/`H`/`h`/`m`/`s` — length drives zero-padding,
 * `M` means month and `m` minute, `H` 24-hour and `h` 12-hour).
 * The display outlet never throws: a null source renders null, an
 * unparsable string or invalid Date renders null, and only a real
 * coordinate renders the word. Callers decide their own empty
 * display (`dateFormat(value, pattern) ?? ''`); loudness is their
 * policy, not the toolbelt's.
 */
export const dateFormat = (source: DateValue | null, pattern: string): string | null => {
  if (source === null) {
    return null;
  }
  try {
    return renderPattern(parseSource(source), pattern);
  } catch {
    return null;
  }
};

// ——— normalizing read ———————————————————————————————————————————————————

/**
 * The full plain-object coordinate of a value — the seven fields
 * with the Monday-first `weekday` (0 = Monday … 6 = Sunday). A
 * `fallback` argument turns the honest throw into a caller-owned
 * safety net: `dateParts(source, null)` reads a value the caller
 * does not fully trust and hands back `null` when it is not one.
 */
export function dateParts(source: DateValue | null): DatePartsFull;
export function dateParts(source: DateValue | null, fallback: null): DatePartsFull | null;
export function dateParts(
  source: DateValue | null,
  fallback: DateParts | DateTimeParts,
): DatePartsFull | DateParts | DateTimeParts;
export function dateParts(
  source: DateValue | null,
  fallback?: DateParts | DateTimeParts | null,
): DatePartsFull | DateParts | DateTimeParts | null {
  try {
    const parts = parseSource(source as DateValue);
    return { ...parts, weekday: weekdayOf(parts) };
  } catch (error) {
    if (arguments.length === 1) {
      throw error;
    }
    return fallback === undefined ? null : fallback;
  }
}

// ——— shift math ———————————————————————————————————————————————————————

const shift = (source: DateValue, seconds: number): DateTimeParts => {
  const shifted = shiftSeconds(parseSource(source), seconds);
  return toParts(
    shifted.year,
    shifted.month,
    shifted.day,
    shifted.hour,
    shifted.minute,
    shifted.second,
  );
};

/** Whole-day shift; the clock part rides along untouched. */
export const addDays = (source: DateValue, delta: number): DateTimeParts =>
  shift(source, delta * 86400);

/** Whole-week shift (7 days); the clock part rides along untouched. */
export const addWeeks = (source: DateValue, delta: number): DateTimeParts =>
  shift(source, delta * 604800);

/** Whole-hour shift; minutes and seconds ride along untouched. */
export const addHours = (source: DateValue, delta: number): DateTimeParts =>
  shift(source, delta * 3600);

/** Whole-minute shift; seconds ride along untouched. */
export const addMinutes = (source: DateValue, delta: number): DateTimeParts =>
  shift(source, delta * 60);

/** Second shift — the exact base of the family. */
export const addSeconds = (source: DateValue, delta: number): DateTimeParts => shift(source, delta);

/** Whole-month shift, clamping the day into the target month; the clock rides along. */
export const addMonths = (source: DateValue, delta: number): DateTimeParts => {
  const parts = parseSource(source);
  const date = shiftMonths(parts, delta);
  return toParts(date.year, date.month, date.day, parts.hour, parts.minute, parts.second);
};

/** Whole-year shift, clamping Feb 29 into Feb 28 on common years; the clock rides along. */
export const addYears = (source: DateValue, delta: number): DateTimeParts => {
  const parts = parseSource(source);
  const date = shiftYears(parts, delta);
  return toParts(date.year, date.month, date.day, parts.hour, parts.minute, parts.second);
};

// ——— today ————————————————————————————————————————————————————————————

/**
 * The native `Date` at the browser-local today midnight — the zero
 * clock of the local calendar. Display and further math stay on the
 * toolbelt: `dateFormat(today(), pattern)`, `addDays(today(), 1)`.
 */
export const today = (): Date => {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
};

// ——— boundaries ———————————————————————————————————————————————————————

const boundary = (
  source: DateValue,
  granularity: Granularity,
  border: (parts: DateTimeParts, granularity: Granularity) => DateTimeParts,
): DateTimeParts => {
  const parts = parseSource(source);
  const edge = border(parts, granularity);
  return toParts(edge.year, edge.month, edge.day, edge.hour, edge.minute, edge.second);
};

/** The first moment of the granularity period: Monday starts the week, midnight starts the day. */
export const dateStartOf = (source: DateValue, granularity: Granularity): DateTimeParts =>
  boundary(source, granularity, startOf);

/** The last moment of the granularity period: Sunday 23:59:59 ends the week, 23:59:59 ends the day. */
export const dateEndOf = (source: DateValue, granularity: Granularity): DateTimeParts =>
  boundary(source, granularity, endOf);

// ——— difference ——————————————————————————————————————————————————————————

/** Calendar-truth `count`/`remainder` difference between two values — see `diffOf`. */
export const dateDiff = (
  end: DateValue,
  start: DateValue,
  unit: DiffUnit,
): { count: number; remainder: number } => diffOf(parseSource(end), parseSource(start), unit);

// ——— epoch ———————————————————————————————————————————————————————————————

/** Milliseconds since the epoch at the browser-local wall clock of the coordinate. */
export const dateTimestamp = (source: DateValue): number => {
  const parts = parseSource(source);
  return new Date(
    parts.year,
    parts.month - 1,
    parts.day,
    parts.hour,
    parts.minute,
    parts.second,
  ).getTime();
};

// ——— unique id ——————————————————————————————————————————————————————————

let lastInstant = 0;
let uidSequence = 0;

/**
 * The unique-ID timestamp: milliseconds since the epoch (13 digits)
 * plus a 4-digit same-millisecond sequence — a 17-digit numeric
 * string with no separators, monotonic across calls.
 */
export const DATEID = (): string => {
  const instant = Date.now();
  if (instant === lastInstant) {
    uidSequence += 1;
    if (uidSequence > 9999) {
      throw new RangeError('colox: DATEID sequence exhausted within one millisecond');
    }
  } else {
    lastInstant = instant;
    uidSequence = 0;
  }
  return `${instant}${String(uidSequence).padStart(4, '0')}`;
};

// ——— second conversions —————————————————————————————————————————————————

/** Raw conversions — no rounding: the caller decides the rounding policy. */
export const secondsToMinutes = (seconds: number): number => seconds / 60;
export const secondsToHours = (seconds: number): number => seconds / 3600;
export const secondsToDays = (seconds: number): number => seconds / 86400;
export const secondsToWeeks = (seconds: number): number => seconds / 604800;
