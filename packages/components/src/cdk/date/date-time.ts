import { WEEKDAY_FULL, WEEKDAY_SHORT } from './constants/calendar';
import { civilFromDays, daysFromCivil, daysInMonth, addMonths, weekdayOf } from './civil';
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

const pad = (value: number, length: number): string =>
  length <= 1 ? String(value) : String(value).padStart(length, '0');

// ——— input normalization ————————————————————————————————————————————
// The grammar lives in parse.ts; only the value-object intercept
// stays here — the factory hands instances through untouched.

const parseValue = (source: DateSource): DateTimeParts => {
  if (source instanceof DateValue) {
    return source.coords;
  }
  return parseSource(source as string | Date | DateParts | DateTimeParts);
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
