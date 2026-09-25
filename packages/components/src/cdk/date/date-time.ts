import { civilFromDays, daysFromCivil, daysInMonth, addMonths } from './calendar';
import { renderPattern } from './format';
import { parseSource } from './parse';
import type { ColoxDate, DateParts, DateSource, DateTimeParts } from './types';

/**
 * The cdk date/time value object — an immutable civil date-time
 * coordinate (year/month/day + hour/minute/second) with chainable
 * math and a token compiler for display.
 *
 * The invariants it upholds:
 * - civil coordinates inside, zero-timezone math everywhere — the
 *   native `Date` appears only at the factory (readers read the
 *   local wall clock) and at `.toDate()` (writer constructs it);
 * - immutable: every chain link returns a new instance;
 * - one coordinate shape: granular spellings (`2026-03`, `2026`)
 *   normalize to their implicit day 1 — no hidden granularity.
 */

const parseValue = (source: DateSource): DateTimeParts => {
  if (source instanceof DateValue) {
    return source.coords;
  }
  return parseSource(source as string | Date | DateParts | DateTimeParts);
};

// ——— the value object —————————————————————————————————————————————————

/** The factory gate: instances may only come from `date()`. */
const FACTORY_TOKEN = Symbol('colox-date-value');

class DateValue implements ColoxDate {
  /** Module-internal coordinates — the class never leaves this file. */
  readonly coords: DateTimeParts;

  constructor(token: symbol, coords: DateTimeParts) {
    if (token !== FACTORY_TOKEN) {
      throw new TypeError('colox: date values come from the date() factory');
    }
    this.coords = coords;
  }

  addDays(delta: number): ColoxDate {
    const shifted = civilFromDays(daysFromCivil(this.coords) + delta);
    return new DateValue(FACTORY_TOKEN, {
      ...shifted,
      hour: this.coords.hour,
      minute: this.coords.minute,
      second: this.coords.second,
    });
  }

  addMonths(delta: number): ColoxDate {
    const shifted = addMonths(this.coords, delta);
    return new DateValue(FACTORY_TOKEN, {
      ...shifted,
      hour: this.coords.hour,
      minute: this.coords.minute,
      second: this.coords.second,
    });
  }

  addYears(delta: number): ColoxDate {
    const year = this.coords.year + delta;
    const day = Math.min(this.coords.day, daysInMonth(year, this.coords.month));
    return new DateValue(FACTORY_TOKEN, { ...this.coords, year, day });
  }

  format(pattern: string): string {
    return renderPattern(this.coords, pattern);
  }

  /**
   * The instant word — the value shifted to UTC and serialized
   * exactly like `new Date().toISOString()`: full clock, milliseconds
   * and `Z` (e.g. `'2026-03-15T00:30:00.000Z'`). This is the wire/
   * interchange shape; display and value rendering stay in `format`.
   */
  iso(): string {
    return this.toDate().toISOString();
  }

  parts(): DateTimeParts {
    return { ...this.coords };
  }

  toDate(): Date {
    return new Date(
      this.coords.year,
      this.coords.month - 1,
      this.coords.day,
      this.coords.hour,
      this.coords.minute,
      this.coords.second,
    );
  }
}

/**
 * The `date` factory: normalizes `string` (datetime, date, `YYYY-MM`
 * and bare `YYYY` spellings), native `Date` (read at the local wall
 * clock) or the parts format (`{ year, month, day, hour?, minute?,
 * second? }`) into a `ColoxDate`; no argument is the current local
 * time. Unparsable or invalid sources throw a `TypeError` — the
 * toolbelt reports honestly, the editors roll back.
 */
export const date = (source?: DateSource): ColoxDate => {
  if (source === undefined) {
    return new DateValue(FACTORY_TOKEN, parseValue(new Date()));
  }
  if (source instanceof DateValue) {
    return source;
  }
  return new DateValue(FACTORY_TOKEN, parseValue(source));
};

/**
 * The plain-object coordinate of a value — the parts format, without
 * the `date()` detour: accepts the same sources the factory does and
 * returns `{ year, month, day, hour, minute, second }`. Unparsable
 * sources throw a `TypeError`.
 *
 * A `fallback` argument turns the honest throw into a caller-owned
 * safety net: `dateParts(source, null)` reads a value the caller
 * does not fully trust and hands back `null` when it is not one —
 * the engine's value-word gate — while `dateParts(source, parts)` is
 * the fallback coordinate itself (returned untouched on failure).
 */
export function dateParts(source: DateSource): DateTimeParts;
export function dateParts(source: DateSource, fallback: null): DateTimeParts | null;
export function dateParts(
  source: DateSource,
  fallback: DateParts | DateTimeParts,
): DateTimeParts | DateParts;
export function dateParts(
  source: DateSource,
  fallback?: DateParts | DateTimeParts | null,
): DateTimeParts | DateParts | null {
  try {
    return parseValue(source);
  } catch (error) {
    if (arguments.length === 1) {
      throw error;
    }
    return fallback === undefined ? null : fallback;
  }
}

/**
 * The standalone display renderer: `format(source, pattern)` without
 * the `date()` detour, and the display outlet never throws — a null
 * source renders null, an unparsable string or invalid Date renders
 * null, and only a real coordinate renders the word. Callers decide
 * their own empty display (`format(value, pattern) ?? ''`); loudness
 * is their policy, not the toolbelt's.
 */
export function format(source: null, pattern: string): null;
export function format(source: string | null, pattern: string): string | null;
export function format(source: ColoxDate | DateParts | DateTimeParts, pattern: string): string;
export function format(source: string | Date, pattern: string): string | null;
export function format(source: DateSource | null, pattern: string): string | null {
  if (source === null) {
    return null;
  }
  const parts = dateParts(source, null);
  return parts === null ? null : renderPattern(parts, pattern);
}
