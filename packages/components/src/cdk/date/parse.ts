import { DATETIME, DATE, INSTANT, YEAR, YEAR_MONTH } from './constants/patterns';
import { daysInMonth } from './calendar';
import type { DateValue, DateTimeParts } from './types';

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
export const toParts = (
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
 * instant — the round-trip lands on the same civil coordinates it
 * started from.
 */
export const instantToLocal = (source: string): DateTimeParts => {
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

/**
 * Normalizes a value into the full six-field coordinate: strings
 * speak the datetime/date/year-month/bare-year/instant grammars,
 * native `Date` is read at the local wall clock, and the parts
 * formats flow through with clock fields defaulting to zero.
 * Calendar- or clock-invalid sources throw — the toolbelt reports
 * honestly, the editors roll back.
 */
export const parseSource = (source: DateValue): DateTimeParts => {
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
    return toParts(
      source.getFullYear(),
      source.getMonth() + 1,
      source.getDate(),
      source.getHours(),
      source.getMinutes(),
      source.getSeconds(),
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
