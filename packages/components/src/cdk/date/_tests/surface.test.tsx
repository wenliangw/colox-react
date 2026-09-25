import { describe, expect, it } from 'vitest';
import {
  DATEID,
  addDays,
  addHours,
  addMinutes,
  addMonths,
  addSeconds,
  addWeeks,
  addYears,
  dateDiff,
  dateEndOf,
  dateFormat,
  dateParts,
  dateStartOf,
  dateTimestamp,
  secondsToDays,
  secondsToHours,
  secondsToMinutes,
  secondsToWeeks,
  today,
} from '../index';

describe('dateParts — the full coordinate', () => {
  it('emits the seven fields with the Monday-first weekday', () => {
    expect(dateParts('2026-03-02')).toEqual({
      year: 2026,
      month: 3,
      day: 2,
      hour: 0,
      minute: 0,
      second: 0,
      weekday: 0,
    });
    expect(dateParts('2026-03-08').weekday).toBe(6);
    expect(dateParts('2026-03-15T08:30:25')).toEqual({
      year: 2026,
      month: 3,
      day: 15,
      hour: 8,
      minute: 30,
      second: 25,
      weekday: 6,
    });
  });

  it('keeps the fallback contract: null fallback reads untrusted values', () => {
    expect(dateParts('2026-03-02', null)).toEqual({
      year: 2026,
      month: 3,
      day: 2,
      hour: 0,
      minute: 0,
      second: 0,
      weekday: 0,
    });
    expect(dateParts('garbage', null)).toBeNull();
    expect(dateParts('2026-02-30', null)).toBeNull();
  });

  it('returns a parts fallback untouched and throws without one', () => {
    const fallback = { year: 1970, month: 1, day: 1 };
    expect(dateParts('garbage', fallback)).toBe(fallback);
    expect(() => dateParts('garbage')).toThrow(TypeError);
  });
});

describe('dateFormat — the display outlet', () => {
  it('renders through the token vocabulary with zero-padding', () => {
    expect(dateFormat('2026-03-15T08:30:25', 'yyyy-MM-dd')).toBe('2026-03-15');
    expect(dateFormat('2026-03-15', 'yyyy/M/d')).toBe('2026/3/15');
    expect(dateFormat('2026-03-15T08:30', 'HH:mm:ss')).toBe('08:30:00');
    expect(dateFormat('2026-03-15T20:30', 'h:m')).toBe('8:30');
    expect(dateFormat('2026-03-02', 'E')).toBe('Mon');
    expect(dateFormat('2026-03-02', 'EEEE')).toBe('Monday');
    expect(dateFormat('2026-03-15', 'yyyy年M月d日')).toBe('2026年3月15日');
  });

  it('never throws — null sources and garbage render null', () => {
    expect(dateFormat(null, 'yyyy-MM-dd')).toBeNull();
    expect(dateFormat('garbage', 'yyyy-MM-dd')).toBeNull();
    expect(dateFormat('2026-02-30', 'yyyy-MM-dd')).toBeNull();
    expect(dateFormat(new Date(Number.NaN), 'yyyy-MM-dd')).toBeNull();
  });

  it('accepts every input spelling', () => {
    expect(dateFormat({ year: 2026, month: 3, day: 15 }, 'yyyy-MM-dd')).toBe('2026-03-15');
    expect(dateFormat(new Date(2026, 2, 15), 'yyyy-MM-dd')).toBe('2026-03-15');
  });
});

describe('dateDiff — calendar-truth count/remainder', () => {
  it('measures the user-approved year example', () => {
    expect(dateDiff('2026-03-10', '2023-01-05', 'year')).toEqual({ count: 3, remainder: 64 });
  });

  it('measures the hour example with minute remainder', () => {
    const result = dateDiff('2026-03-10T10:30', '2026-03-10T08:00', 'hour');
    expect(result.count).toBe(2);
    expect(result.remainder).toBeCloseTo(30);
  });

  it('degrades year → day, month → day across month lengths', () => {
    expect(dateDiff('2026-03-31', '2026-01-31', 'month')).toEqual({ count: 2, remainder: 0 });
    // Feb ends early: Jan 31 → Feb 28 is one whole month, then 3 days of residue.
    expect(dateDiff('2026-03-03', '2026-01-31', 'month')).toEqual({ count: 1, remainder: 3 });
    // Leap-year residue: 2024-02-29 is exactly 1y6d after 2023-01-01's... no — 2023-01-01 +1y = 2024-01-01, +6d.
    expect(dateDiff('2024-01-07', '2023-01-01', 'year')).toEqual({ count: 1, remainder: 6 });
  });

  it('degrades day → hour, hour → minute, minute → second, second → 0', () => {
    expect(dateDiff('2026-03-11T06:30', '2026-03-10', 'day')).toEqual({ count: 1, remainder: 6.5 });
    expect(dateDiff('2026-03-10T08:30:30', '2026-03-10T08:00', 'minute')).toEqual({
      count: 30,
      remainder: 30,
    });
    expect(dateDiff('2026-03-10T08:00:45', '2026-03-10T08:00', 'second')).toEqual({
      count: 45,
      remainder: 0,
    });
  });

  it('flips negative when the end precedes the start', () => {
    const result = dateDiff('2026-03-05', '2026-03-10', 'day');
    expect(result.count).toBe(-5);
    expect(result.remainder).toBeCloseTo(0);
  });

  it('returns zero for equal endpoints', () => {
    expect(dateDiff('2026-03-10', '2026-03-10', 'year')).toEqual({ count: 0, remainder: 0 });
  });
});

describe('the add family — pure shifts', () => {
  it('addDays crosses month and leap boundaries', () => {
    expect(addDays('2026-02-27', 2)).toMatchObject({ year: 2026, month: 3, day: 1 });
    expect(addDays('2024-02-28', 1)).toMatchObject({ year: 2024, month: 2, day: 29 });
  });

  it('addWeeks and clock-carrying shifts normalize', () => {
    expect(addWeeks('2026-02-23', 1)).toMatchObject({ year: 2026, month: 3, day: 2 });
    expect(addHours('2026-03-10T23:00', 2)).toEqual({
      year: 2026,
      month: 3,
      day: 11,
      hour: 1,
      minute: 0,
      second: 0,
    });
    expect(addMinutes('2026-03-10T23:59', 1)).toMatchObject({ day: 11, hour: 0, minute: 0 });
    expect(addSeconds('2026-03-10T00:00:00', -1)).toMatchObject({
      day: 9,
      hour: 23,
      minute: 59,
      second: 59,
    });
  });

  it('addMonths clamps the day into the target month', () => {
    expect(addMonths('2026-01-31', 1)).toMatchObject({ year: 2026, month: 2, day: 28 });
    expect(addMonths('2026-01-31', 2)).toMatchObject({ year: 2026, month: 3, day: 31 });
  });

  it('addYears clamps Feb 29 and throws beyond the year range', () => {
    expect(addYears('2024-02-29', 1)).toMatchObject({ year: 2025, month: 2, day: 28 });
    expect(addYears('2026-03-15', -1)).toMatchObject({ year: 2025, month: 3, day: 15 });
    expect(() => addYears('9999-01-01', 1)).toThrow(TypeError);
  });
});

describe('today', () => {
  it('is a native Date at the local midnight', () => {
    const result = today();
    expect(result).toBeInstanceOf(Date);
    expect(result.getHours()).toBe(0);
    expect(result.getMinutes()).toBe(0);
    expect(result.getSeconds()).toBe(0);
    expect(result.getTime()).toBeLessThanOrEqual(Date.now());
  });
});

describe('dateStartOf / dateEndOf — granularity boundaries', () => {
  const anchor = '2026-03-10T12:34:56'; // a Tuesday

  it('Monday starts the week and Sunday 23:59:59 ends it', () => {
    expect(dateStartOf(anchor, 'week')).toMatchObject({
      month: 3,
      day: 9,
      hour: 0,
      minute: 0,
      second: 0,
    });
    expect(dateEndOf(anchor, 'week')).toMatchObject({
      month: 3,
      day: 15,
      hour: 23,
      minute: 59,
      second: 59,
    });
  });

  it('start/end each granularity', () => {
    expect(dateStartOf(anchor, 'year')).toMatchObject({
      month: 1,
      day: 1,
      hour: 0,
      minute: 0,
      second: 0,
    });
    expect(dateEndOf(anchor, 'year')).toMatchObject({
      month: 12,
      day: 31,
      hour: 23,
      minute: 59,
      second: 59,
    });
    expect(dateStartOf(anchor, 'month')).toMatchObject({ day: 1, hour: 0, minute: 0, second: 0 });
    expect(dateEndOf(anchor, 'month')).toMatchObject({ day: 31, hour: 23, minute: 59, second: 59 });
    expect(dateEndOf('2024-02-15', 'month')).toMatchObject({ day: 29 });
    expect(dateStartOf(anchor, 'day')).toMatchObject({ hour: 0, minute: 0, second: 0 });
    expect(dateEndOf(anchor, 'day')).toMatchObject({ hour: 23, minute: 59, second: 59 });
    expect(dateStartOf(anchor, 'hour')).toMatchObject({ hour: 12, minute: 0, second: 0 });
    expect(dateStartOf(anchor, 'minute')).toMatchObject({ minute: 34, second: 0 });
    expect(dateStartOf(anchor, 'second')).toMatchObject({ second: 56 });
  });
});

describe('dateTimestamp', () => {
  it('reads the local wall clock epoch milliseconds', () => {
    expect(dateTimestamp('1970-01-01T00:00:00')).toBe(new Date(1970, 0, 1).getTime());
    expect(dateTimestamp('2026-03-15T08:30:25')).toBe(new Date(2026, 2, 15, 8, 30, 25).getTime());
  });
});

describe('DATEID', () => {
  it('is a 17-digit numeric string, no separators, monotonic', () => {
    const first = DATEID();
    const second = DATEID();
    expect(first).toMatch(/^\d{17}$/);
    expect(second).toMatch(/^\d{17}$/);
    // Note: 17 digits exceed the safe Number range — compare the
    // equal-length digit strings lexicographically (numeric order).
    expect(second > first).toBe(true);
  });
});

describe('the secondsTo conversions — raw, no rounding', () => {
  it('divides by the exact constants', () => {
    expect(secondsToMinutes(90)).toBe(1.5);
    expect(secondsToHours(5400)).toBe(1.5);
    expect(secondsToDays(129600)).toBe(1.5);
    expect(secondsToWeeks(907200)).toBe(1.5);
  });
});
