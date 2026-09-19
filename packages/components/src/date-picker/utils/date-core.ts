import type {
  DateParts,
  DatePickerPicker,
  MonthGridCell,
  MonthViewCell,
  YearViewCell,
} from '../types';

const DAYS_IN_MONTH = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

/** The month grid is 6×7 (42 cells) — a fixed shape keeps the panel height stable. */
export const GRID_CELL_COUNT = 42;

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

export const partsToIso = ({ year, month, day }: DateParts): string => {
  const yyyy = String(year).padStart(4, '0');
  const mm = String(month).padStart(2, '0');
  const dd = String(day).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
};

export const isoToParts = (iso: string): DateParts | null => {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  if (match === null) {
    return null;
  }
  const parts = { year: Number(match[1]), month: Number(match[2]), day: Number(match[3]) };
  return isValidDate(parts) ? parts : null;
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
export const weekdayOfParts = (parts: DateParts): number => {
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
  const firstWeekday = weekdayOfParts({ year, month, day: 1 });
  const startDays = daysFromCivil({ year, month, day: 1 }) - firstWeekday;
  return Array.from({ length: GRID_CELL_COUNT }, (_, index) => {
    const parts = civilFromDays(startDays + index);
    return {
      iso: partsToIso(parts),
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

/** Lexicographic ISO comparison: canonical strings sort chronologically. */
export const compareIso = (a: string, b: string): number => (a < b ? -1 : a > b ? 1 : 0);

/**
 * Parses a canonical granularity ISO value — `YYYY`, `YYYY-MM` or
 * `YYYY-MM-DD` — into day-accurate parts (missing month/day default
 * to 1). Calendar-invalid values return null. Padding is strict:
 * 2-digit months/days (canonical), no calendar exceptions.
 */
export const parseGranularIso = (iso: string): DateParts | null => {
  const match = /^(\d{4})(?:-(\d{2})(?:-(\d{2}))?)?$/.exec(iso);
  if (match === null) {
    return null;
  }
  const parts = {
    year: Number(match[1]),
    month: match[2] === undefined ? 1 : Number(match[2]),
    day: match[3] === undefined ? 1 : Number(match[3]),
  };
  return isValidDate(parts) ? parts : null;
};

/** Renders day-accurate parts down to the picker's canonical granularity. */
export const partsToGranularIso = (parts: DateParts, picker: DatePickerPicker): string => {
  if (picker === 'year') {
    return String(parts.year).padStart(4, '0');
  }
  const year = String(parts.year).padStart(4, '0');
  if (picker === 'month') {
    return `${year}-${String(parts.month).padStart(2, '0')}`;
  }
  return partsToIso(parts);
};

/** The decade window a year belongs to (2026 → 2020). */
export const decadeOf = (year: number): number => Math.floor(year / 10) * 10;

/** The current cell's granularity iso, e.g. today for a year picker is `YYYY`. */
export const granularIsoOf = (iso: string, picker: DatePickerPicker): string => {
  const parts = parseGranularIso(iso);
  return parts === null ? iso : partsToGranularIso(parts, picker);
};

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

/** Today in the browser's local calendar (highlight + view seeding only). */
export const todayIso = (): string => {
  const now = new Date();
  return partsToIso({ year: now.getFullYear(), month: now.getMonth() + 1, day: now.getDate() });
};
