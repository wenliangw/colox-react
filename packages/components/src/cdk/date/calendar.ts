import type { DateParts, DateTimeParts, MonthGridCell, MonthViewCell, YearViewCell } from './types';
import { DAYS_IN_MONTH, GRID_CELL_COUNT } from './constants/calendar';

export const isLeapYear = (year: number): boolean =>
  (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;

export const daysInMonth = (year: number, month: number): number => {
  if (month === 2 && isLeapYear(year)) {
    return 29;
  }
  return DAYS_IN_MONTH[month - 1];
};

export const isValidDate = ({ year, month, day }: DateParts): boolean => {
  if (year < 1 || year > 9999 || month < 1 || month > 12 || day < 1) {
    return false;
  }
  return day <= daysInMonth(year, month);
};

/**
 * The canonical day value word (`YYYY-MM-DD`, fixed 10-char width) —
 * module-private: the public way from coordinates to a value string
 * is `date(parts).format(...)` on the toolbelt entry.
 */
const valueWord = ({ year, month, day }: DateParts): string => {
  const yyyy = String(year).padStart(4, '0');
  const mm = String(month).padStart(2, '0');
  const dd = String(day).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
};

/**
 * Days since 1970-01-01 for a civil date (Howard Hinnant's algorithm) —
 * the zero-timezone date algebra that keeps weekday math from drifting
 * with browser timezones (`Date` parses `YYYY-MM-DD` as UTC midnight).
 */
export const daysFromCivil = ({ year, month, day }: DateParts): number => {
  const shifted = month <= 2 ? year - 1 : year;
  const era = Math.floor((shifted >= 0 ? shifted : shifted - 399) / 400);
  const yearOfEra = shifted - era * 400;
  const doy = Math.floor((153 * (month + (month > 2 ? -3 : 9)) + 2) / 5) + day - 1;
  const doe = yearOfEra * 365 + Math.floor(yearOfEra / 4) - Math.floor(yearOfEra / 100) + doy;
  return era * 146097 + doe - 719468;
};

export const civilFromDays = (days: number): DateParts => {
  const shiftedDays = days + 719468;
  const era = Math.floor((shiftedDays >= 0 ? shiftedDays : shiftedDays - 146096) / 146097);
  const doe = shiftedDays - era * 146097;
  const yearOfEra = Math.floor(
    (doe - Math.floor(doe / 1460) + Math.floor(doe / 36524) - Math.floor(doe / 146096)) / 365,
  );
  const year = yearOfEra + era * 400;
  const doy = doe - (365 * yearOfEra + Math.floor(yearOfEra / 4) - Math.floor(yearOfEra / 100));
  const mp = Math.floor((5 * doy + 2) / 153);
  const day = doy - Math.floor((153 * mp + 2) / 5) + 1;
  const month = mp + (mp < 10 ? 3 : -9);
  return { year: year + (month <= 2 ? 1 : 0), month, day };
};

/** Monday-first weekday index: 0 = Monday … 6 = Sunday. */
export const weekdayOf = (parts: DateParts): number => {
  const index = (daysFromCivil(parts) + 3) % 7;
  return index < 0 ? index + 7 : index;
};

/**
 * The 6×7 month grid, Monday-first: cells before the 1st and after
 * the month end fill from the adjacent months so the panel never
 * shifts shape. `inMonth` marks the cells that belong to the shown
 * month (the others render dimmed).
 */
export const buildMonthGrid = (year: number, month: number): MonthGridCell[] => {
  const firstWeekday = weekdayOf({ year, month, day: 1 });
  const startDays = daysFromCivil({ year, month, day: 1 }) - firstWeekday;
  return Array.from({ length: GRID_CELL_COUNT }, (_, index) => {
    const parts = civilFromDays(startDays + index);
    return {
      iso: valueWord(parts),
      day: parts.day,
      inMonth: parts.year === year && parts.month === month,
    };
  });
};

/** Shifts a date by whole months, clamping the day into the target month. */
export const addMonths = (parts: DateParts, delta: number): DateParts => {
  const index = parts.year * 12 + (parts.month - 1) + delta;
  const year = Math.floor(index / 12);
  const month = index - year * 12 + 1;
  return { year, month, day: Math.min(parts.day, daysInMonth(year, month)) };
};

/** The decade window a year belongs to (2026 → 2020). */
export const decadeOf = (year: number): number => Math.floor(year / 10) * 10;

/** The 12 month cells of a year (month view), canonical `YYYY-MM`. */
export const buildMonthViewCells = (year: number): MonthViewCell[] =>
  Array.from({ length: 12 }, (_, index) => {
    const month = index + 1;
    return {
      iso: `${String(year).padStart(4, '0')}-${String(month).padStart(2, '0')}`,
      month,
    };
  });

/** The 12-year window cells (year view), canonical `YYYY`. */
export const buildYearViewCells = (decadeStart: number): YearViewCell[] =>
  Array.from({ length: 12 }, (_, index) => {
    const year = decadeStart + index;
    return { iso: String(year).padStart(4, '0'), year };
  });

// ——— the pure shift/structure math —————————————————————————————————————
// The public capability functions are thin wiring over these: every
// entry parses to the coordinate (parse.ts), does its algebra here,
// and re-validates through `toParts` on the way out.

/** Whole-year shift on a full coordinate, clamping Feb 29 into Feb 28; the clock rides along. */
export const addYears = (parts: DateTimeParts, delta: number): DateTimeParts => {
  const year = parts.year + delta;
  return {
    year,
    month: parts.month,
    day: Math.min(parts.day, daysInMonth(year, parts.month)),
    hour: parts.hour,
    minute: parts.minute,
    second: parts.second,
  };
};

/** Exact second-precision shift — the base of every sub-month `add*`; handles negatives. */
export const shiftSeconds = (parts: DateTimeParts, seconds: number): DateTimeParts => {
  const total =
    daysFromCivil(parts) * 86400 + parts.hour * 3600 + parts.minute * 60 + parts.second + seconds;
  const dayNumber = Math.floor(total / 86400);
  const secondOfDay = total - dayNumber * 86400;
  const date = civilFromDays(dayNumber);
  return {
    year: date.year,
    month: date.month,
    day: date.day,
    hour: Math.floor(secondOfDay / 3600),
    minute: Math.floor((secondOfDay % 3600) / 60),
    second: secondOfDay % 60,
  };
};

/** The granularities `dateStartOf`/`dateEndOf` speak. */
export type Granularity = 'year' | 'month' | 'week' | 'day' | 'hour' | 'minute' | 'second';

/** The first moment of the granularity period: Monday starts the week, midnight starts the day. */
export const startOf = (parts: DateTimeParts, granularity: Granularity): DateTimeParts => {
  switch (granularity) {
    case 'year':
      return { ...parts, month: 1, day: 1, hour: 0, minute: 0, second: 0 };
    case 'month':
      return { ...parts, day: 1, hour: 0, minute: 0, second: 0 };
    case 'week':
      return shiftSeconds({ ...parts, hour: 0, minute: 0, second: 0 }, -weekdayOf(parts) * 86400);
    case 'day':
      return { ...parts, hour: 0, minute: 0, second: 0 };
    case 'hour':
      return { ...parts, minute: 0, second: 0 };
    case 'minute':
      return { ...parts, second: 0 };
    case 'second':
      return { ...parts };
  }
};

/** The last moment of the granularity period: Sunday 23:59:59 ends the week, 23:59:59 ends the day. */
export const endOf = (parts: DateTimeParts, granularity: Granularity): DateTimeParts => {
  switch (granularity) {
    case 'year':
      return { ...parts, month: 12, day: 31, hour: 23, minute: 59, second: 59 };
    case 'month':
      return {
        ...parts,
        day: daysInMonth(parts.year, parts.month),
        hour: 23,
        minute: 59,
        second: 59,
      };
    case 'week':
      return shiftSeconds(startOf(parts, 'week'), 7 * 86400 - 1);
    case 'day':
      return { ...parts, hour: 23, minute: 59, second: 59 };
    case 'hour':
      return { ...parts, minute: 59, second: 59 };
    case 'minute':
      return { ...parts, second: 59 };
    case 'second':
      return { ...parts };
  }
};

/** The units `dateDiff` measures — calendar truth down to the whole second. */
export type DiffUnit = 'year' | 'month' | 'day' | 'hour' | 'minute' | 'second';

/** A measured difference: whole units plus the honest residue in the next-lower unit. */
export interface DiffResult {
  count: number;
  remainder: number;
}

const secondOfDay = (parts: DateTimeParts): number =>
  parts.hour * 3600 + parts.minute * 60 + parts.second;

const compareParts = (a: DateTimeParts, b: DateTimeParts): number => {
  const days = daysFromCivil(a) - daysFromCivil(b);
  return days !== 0 ? days : secondOfDay(a) - secondOfDay(b);
};

const secondsBetween = (from: DateTimeParts, to: DateTimeParts): number =>
  (daysFromCivil(to) - daysFromCivil(from)) * 86400 + secondOfDay(to) - secondOfDay(from);

const pushYears = (start: DateTimeParts, delta: number): DateTimeParts => addYears(start, delta);

const pushMonths = (start: DateTimeParts, delta: number): DateTimeParts => {
  const date = addMonths(start, delta);
  return { ...start, year: date.year, month: date.month, day: date.day };
};

/**
 * Calendar-truth difference: `count` is the max number of whole units
 * pushed forward from `start` without crossing `end`; `remainder` is
 * the real residue to that pushed point, measured in the next-lower
 * unit (year/month → day, day → hour, hour → minute, minute →
 * second; seconds are the floor, so `second` leaves remainder 0).
 * `end` before `start` yields the flipped negative result.
 */
export const diffOf = (end: DateTimeParts, start: DateTimeParts, unit: DiffUnit): DiffResult => {
  if (compareParts(start, end) > 0) {
    const flipped = diffOf(start, end, unit);
    return { count: -flipped.count, remainder: -flipped.remainder };
  }
  if (unit === 'year' || unit === 'month') {
    const push = unit === 'year' ? pushYears : pushMonths;
    let count =
      unit === 'year'
        ? end.year - start.year
        : (end.year - start.year) * 12 + (end.month - start.month);
    if (compareParts(push(start, count), end) > 0) {
      count -= 1;
    }
    const pushed = push(start, count);
    return { count, remainder: secondsBetween(pushed, end) / 86400 };
  }
  if (unit === 'second') {
    return { count: secondsBetween(start, end), remainder: 0 };
  }
  const secondsPerUnit = unit === 'day' ? 86400 : unit === 'hour' ? 3600 : 60;
  const remainderPerUnit = unit === 'day' ? 3600 : unit === 'hour' ? 60 : 1;
  const count = Math.floor(secondsBetween(start, end) / secondsPerUnit);
  const pushed = shiftSeconds(start, count * secondsPerUnit);
  return { count, remainder: secondsBetween(pushed, end) / remainderPerUnit };
};
