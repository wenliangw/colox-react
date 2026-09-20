import { civilFromDays, daysFromCivil, daysInMonth, addMonths, weekdayOfParts } from './civil';

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

/** What the `date` factory and `format` accept: ISO-ish strings, native Dates or an instance. */
export type DateSource = string | Date | ColoxDate;

/** The coordinates a pattern token renders. */
interface DateTimeParts {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  second: number;
}

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

const parseSource = (source: string | Date): DateTimeParts => {
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
  return toParts(
    source.getFullYear(),
    source.getMonth() + 1,
    source.getDate(),
    source.getHours(),
    source.getMinutes(),
    source.getSeconds(),
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
      return names[weekdayOfParts(parts)];
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

export class ColoxDate {
  private readonly parts: DateTimeParts;

  private constructor(parts: DateTimeParts) {
    this.parts = parts;
  }

  /** The class-side entry: the only way to construct an instance (the `date` factory is the public path). */
  static fromParts(parts: DateTimeParts): ColoxDate {
    return new ColoxDate(parts);
  }

  /** Whole-day shift; the clock part rides along untouched. */
  addDays(delta: number): ColoxDate {
    const shifted = civilFromDays(daysFromCivil(this.parts) + delta);
    return new ColoxDate({
      ...shifted,
      hour: this.parts.hour,
      minute: this.parts.minute,
      second: this.parts.second,
    });
  }

  /** Whole-month shift, clamping the day into the target month; the clock rides along. */
  addMonths(delta: number): ColoxDate {
    const shifted = addMonths(this.parts, delta);
    return new ColoxDate({
      ...shifted,
      hour: this.parts.hour,
      minute: this.parts.minute,
      second: this.parts.second,
    });
  }

  /** Whole-year shift, clamping Feb 29 into Feb 28 on common years; the clock rides along. */
  addYears(delta: number): ColoxDate {
    const year = this.parts.year + delta;
    const day = Math.min(this.parts.day, daysInMonth(year, this.parts.month));
    return new ColoxDate({ ...this.parts, year, day });
  }

  /** Renders through the token pattern (see the module vocabulary). */
  format(pattern: string): string {
    return renderPattern(this.parts, pattern);
  }

  /**
   * The instant word — the value shifted to UTC and serialized
   * exactly like `new Date().toISOString()`: full clock, milliseconds
   * and `Z` (e.g. `'2026-03-15T00:30:00.000Z'`). This is the wire/
   * interchange shape; display rendering stays in `format`. With a
   * pattern, renders the civil coordinates through the token grammar.
   */
  iso(pattern?: string): string {
    if (pattern === undefined) {
      return this.toDate().toISOString();
    }
    return renderPattern(this.parts, pattern);
  }

  /** The native Date at the browser-local calendar wall clock. */
  toDate(): Date {
    return new Date(
      this.parts.year,
      this.parts.month - 1,
      this.parts.day,
      this.parts.hour,
      this.parts.minute,
      this.parts.second,
    );
  }
}

/**
 * The `date` factory: normalizes `string` (datetime, date, `YYYY-MM`
 * and bare `YYYY` spellings) or native `Date` (read at the local wall
 * clock) into a `ColoxDate`; no argument is the current local time.
 * Unparsable or invalid sources throw a `TypeError` — the toolbelt
 * reports honestly, the editors roll back.
 */
export const date = (source?: DateSource): ColoxDate => {
  if (source === undefined) {
    return ColoxDate.fromParts(parseSource(new Date()));
  }
  if (source instanceof ColoxDate) {
    return source;
  }
  return ColoxDate.fromParts(parseSource(source));
};

/**
 * The standalone formatter: `format(source, pattern)` without the
 * `date()` detour — accepts the same `string | Date | ColoxDate`
 * sources the factory does.
 */
export const format = (source: DateSource, pattern: string): string => {
  const value = source instanceof ColoxDate ? source : ColoxDate.fromParts(parseSource(source));
  return value.format(pattern);
};
