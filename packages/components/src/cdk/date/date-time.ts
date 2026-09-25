import { civilFromDays, daysFromCivil, daysInMonth, addMonths, weekdayOf } from './civil';
import type { DateParts } from './types';

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

const pad = (value: number, length: number): string =>
  length <= 1 ? String(value) : String(value).padStart(length, '0');

// ——— input normalization ————————————————————————————————————————————

const DATETIME = /^(\d{4})-(\d{2})-(\d{2})[T ](\d{1,2}):(\d{1,2})(?::(\d{1,2}))?$/;
const DATE = /^(\d{4})[/-](\d{1,2})[/-](\d{1,2})$/;
const YEAR_MONTH = /^(\d{4})[/-](\d{1,2})$/;
const YEAR = /^(\d{4})$/;
/** The instant word `iso()` emits: full clock, milliseconds, `Z`. Offsets stay an extension point. */
const INSTANT = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})(?:\.(\d{1,3}))?Z$/;

const isValidClock = (hour: number, minute: number, second: number): boolean =>
  Number.isInteger(hour) &&
  hour >= 0 &&
  hour <= 23 &&
  Number.isInteger(minute) &&
  minute >= 0 &&
  minute <= 59 &&
  Number.isInteger(second) &&
  second >= 0 &&
  second <= 59;

/** A full civil+clock coordinate, calendar- and clock-validated. */
const toParts = (
  year: number,
  month: number,
  day: number,
  hour = 0,
  minute = 0,
  second = 0,
): DateTimeParts => {
  const calendarValid =
    Number.isInteger(year) &&
    year >= 1 &&
    year <= 9999 &&
    Number.isInteger(month) &&
    month >= 1 &&
    month <= 12 &&
    Number.isInteger(day) &&
    day >= 1 &&
    day <= daysInMonth(year, month);
  if (!calendarValid || !isValidClock(hour, minute, second)) {
    throw new TypeError(
      `colox: invalid date value ${year}-${month}-${day} ${hour}:${minute}:${second}`,
    );
  }
  return { year, month, day, hour, minute, second };
};

/**
 * An instant word (`…Z`): the UTC digits are validated as a civil
 * coordinate, the instant itself is built with `Date.UTC` (never
 * `new Date(string)`), and the local wall clock is read back off the
 * instant — the round-trip `date(x.iso())` lands on the same civil
 * coordinates it started from.
 */
const instantToLocal = (source: string): DateTimeParts => {
  const match = INSTANT.exec(source);
  if (match === null) {
    throw new TypeError(`colox: cannot parse date value "${source}"`);
  }
  const utc = toParts(
    Number(match[1]),
    Number(match[2]),
    Number(match[3]),
    Number(match[4]),
    Number(match[5]),
    Number(match[6]),
  );
  const local = new Date(
    Date.UTC(utc.year, utc.month - 1, utc.day, utc.hour, utc.minute, utc.second),
  );
  return toParts(
    local.getFullYear(),
    local.getMonth() + 1,
    local.getDate(),
    local.getHours(),
    local.getMinutes(),
    local.getSeconds(),
  );
};

const parseSource = (source: DateSource): DateTimeParts => {
  if (source instanceof DateValue) {
    return source.coords;
  }
  if (typeof source === 'string') {
    const trimmed = source.trim();
    if (INSTANT.test(trimmed)) {
      return instantToLocal(trimmed);
    }
    const dateTime = DATETIME.exec(trimmed);
    if (dateTime !== null) {
      return toParts(
        Number(dateTime[1]),
        Number(dateTime[2]),
        Number(dateTime[3]),
        Number(dateTime[4]),
        Number(dateTime[5]),
        dateTime[6] === undefined ? 0 : Number(dateTime[6]),
      );
    }
    const date = DATE.exec(trimmed);
    if (date !== null) {
      return toParts(Number(date[1]), Number(date[2]), Number(date[3]));
    }
    const yearMonth = YEAR_MONTH.exec(trimmed);
    if (yearMonth !== null) {
      return toParts(Number(yearMonth[1]), Number(yearMonth[2]), 1);
    }
    const year = YEAR.exec(trimmed);
    if (year !== null) {
      return toParts(Number(year[1]), 1, 1);
    }
    throw new TypeError(`colox: cannot parse date value "${source}"`);
  }
  if (source instanceof Date) {
    const native = source as Date;
    return toParts(
      native.getFullYear(),
      native.getMonth() + 1,
      native.getDate(),
      native.getHours(),
      native.getMinutes(),
      native.getSeconds(),
    );
  }
  // The parts format — day-only or full coordinates. Missing clock
  // fields default to zero; invalid calendars throw like bad strings.
  const parts = source as Partial<DateTimeParts>;
  return toParts(
    Number(parts.year),
    Number(parts.month),
    Number(parts.day),
    parts.hour ?? 0,
    parts.minute ?? 0,
    parts.second ?? 0,
  );
};

// ——— pattern compilation —————————————————————————————————————————————

/**
 * The combined date/time token vocabulary. Case carries the word for
 * `M`/`m` (month vs minute) and `H`/`h` (24-hour vs 12-hour); every
 * other token letter is case-insensitive. Token length drives the
 * zero-padding (`M` bare, `MM` padded) — the same grammar rules the
 * `format`, `iso` and the date editor's own compiler live by.
 */
type TokenType = 'year' | 'month' | 'day' | 'weekday' | 'hour24' | 'hour12' | 'minute' | 'second';

type PatternPart = { type: TokenType; length: number } | { type: 'literal'; text: string };

const tokenLetter = (char: string): TokenType | null => {
  if (char === 'M') {
    return 'month';
  }
  if (char === 'm') {
    return 'minute';
  }
  if (char === 'H') {
    return 'hour24';
  }
  if (char === 'h') {
    return 'hour12';
  }
  const map: Record<string, TokenType> = { y: 'year', d: 'day', e: 'weekday', s: 'second' };
  return map[char.toLowerCase()] ?? null;
};

/** Compiles the combined pattern: same-letter runs make one token, the rest are literals. */
const compilePattern = (pattern: string): PatternPart[] => {
  const parts: PatternPart[] = [];
  let index = 0;
  while (index < pattern.length) {
    const type = tokenLetter(pattern[index]);
    if (type !== null) {
      // Runs keep the case-themselves: `HH` and `hh` are distinct tokens.
      let end = index;
      while (end < pattern.length && pattern[end] === pattern[index]) {
        end += 1;
      }
      parts.push({ type, length: end - index });
      index = end;
    } else {
      let end = index;
      while (end < pattern.length && tokenLetter(pattern[end]) === null) {
        end += 1;
      }
      parts.push({ type: 'literal', text: pattern.slice(index, end) });
      index = end;
    }
  }
  return parts;
};

const WEEKDAY_SHORT = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const WEEKDAY_FULL = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const renderPart = (part: PatternPart, parts: DateTimeParts): string => {
  if (part.type === 'literal') {
    return part.text;
  }
  switch (part.type) {
    case 'year': {
      const text = String(parts.year);
      return part.length <= 2 ? text.slice(-2).padStart(part.length, '0') : text.padStart(4, '0');
    }
    case 'month':
      return pad(parts.month, part.length);
    case 'day':
      return pad(parts.day, part.length);
    case 'weekday': {
      const names = part.length >= 4 ? WEEKDAY_FULL : WEEKDAY_SHORT;
      return names[weekdayOf(parts)];
    }
    case 'hour24':
      return pad(parts.hour, part.length);
    case 'hour12':
      return pad(parts.hour % 12 || 12, part.length);
    case 'minute':
      return pad(parts.minute, part.length);
    case 'second':
      return pad(parts.second, part.length);
  }
};

const renderPattern = (parts: DateTimeParts, pattern: string): string =>
  compilePattern(pattern)
    .map((part) => renderPart(part, parts))
    .join('');

// ——— the value object —————————————————————————————————————————————————

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
   * interchange shape; display rendering stays in `format`. With a
   * pattern, renders the civil coordinates through the token grammar.
   */
  iso(pattern?: string): string;

  /** The plain-object coordinate (`DateTimeParts`): the parts format `date()` reads back. */
  parts(): DateTimeParts;

  /** The native Date at the browser-local calendar wall clock. */
  toDate(): Date;
}

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

  iso(pattern?: string): string {
    if (pattern === undefined) {
      return this.toDate().toISOString();
    }
    return renderPattern(this.coords, pattern);
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
    return new DateValue(FACTORY_TOKEN, parseSource(new Date()));
  }
  if (source instanceof DateValue) {
    return source;
  }
  return new DateValue(FACTORY_TOKEN, parseSource(source));
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
    return parseSource(source);
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
