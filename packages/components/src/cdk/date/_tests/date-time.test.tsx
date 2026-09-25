import { describe, expect, it } from 'vitest';
import { date, dateParts, format } from '../date-time';

describe('factory input normalization', () => {
  it('accepts date spellings — strict, lenient separators', () => {
    expect(date('2026-03-15').format('yyyy-MM-dd')).toBe('2026-03-15');
    expect(date('2026/3/2').format('yyyy-MM-dd')).toBe('2026-03-02');
  });

  it('accepts datetime spellings — T or space, seconds optional', () => {
    expect(date('2026-03-15T08:30').format('yyyy-MM-dd HH:mm:ss')).toBe('2026-03-15 08:30:00');
    expect(date('2026-03-15 08:30:05').format('HH:mm:ss')).toBe('08:30:05');
  });

  it('normalizes granular spellings to their implicit day 1', () => {
    expect(date('2026-03').format('yyyy-MM-dd')).toBe('2026-03-01');
    expect(date('2026').format('yyyy-MM-dd')).toBe('2026-01-01');
  });

  it('reads a native Date at the local wall clock', () => {
    expect(date(new Date(2026, 2, 15, 8, 30)).format('yyyy-MM-dd HH:mm')).toBe('2026-03-15 08:30');
  });

  it('defaults to the current local time', () => {
    const now = new Date();
    const word = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    expect(date().format('yyyy-MM-dd')).toBe(word);
  });

  it('throws on calendar- or clock-invalid sources', () => {
    expect(() => date('2026-02-30')).toThrow(TypeError);
    expect(() => date('2026-13-01')).toThrow(TypeError);
    expect(() => date('2026-03-15T24:00')).toThrow(TypeError);
    expect(() => date('2026-03-15T08:60')).toThrow(TypeError);
    expect(() => date('not a date')).toThrow(TypeError);
  });

  it('passes instances through untouched', () => {
    const value = date('2026-03-15');
    expect(date(value)).toBe(value);
  });
});

describe('instant word (iso)', () => {
  it('serializes exactly like Date.prototype.toISOString — full clock, T, Z', () => {
    const value = date('2026-03-15T08:30:05');
    expect(value.iso()).toBe(new Date(2026, 2, 15, 8, 30, 5).toISOString());
    expect(value.iso()).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
  });

  it('round-trips its own instant word back to the same civil coordinates', () => {
    const value = date('2026-03-15T08:30:05');
    expect(date(value.iso()).format('yyyy-MM-dd HH:mm:ss')).toBe('2026-03-15 08:30:05');
  });

  it('accepts the instant word spelling — with or without milliseconds', () => {
    const instant = date('2026-03-15T08:30').iso();
    expect(date(instant).format('yyyy-MM-dd HH:mm')).toBe('2026-03-15 08:30');
    const utcLocal = new Date(Date.UTC(2026, 2, 15, 8, 30, 0));
    const expected = `${String(utcLocal.getHours()).padStart(2, '0')}:${String(
      utcLocal.getMinutes(),
    ).padStart(2, '0')}`;
    expect(date('2026-03-15T08:30:00Z').format('HH:mm')).toBe(expected);
  });

  it('rejects calendar-invalid instant words instead of rolling over', () => {
    expect(() => date('2026-02-30T00:00:00.000Z')).toThrow(TypeError);
  });

  it('renders civil coordinates through a pattern when given one', () => {
    expect(date('2026-03-15T08:30').iso('HH:mm')).toBe('08:30');
    expect(date('2026-03-15T08:30').iso('yyyy/MM/dd')).toBe('2026/03/15');
  });
});

describe('chain math', () => {
  it('shifts days across month boundaries', () => {
    expect(date('2026-02-28').addDays(2).format('yyyy-MM-dd')).toBe('2026-03-02');
  });

  it('clamps month shifts into the target month', () => {
    expect(date('2026-01-31').addMonths(1).format('yyyy-MM-dd')).toBe('2026-02-28');
    expect(date('2026-03-31').addMonths(-1).format('yyyy-MM-dd')).toBe('2026-02-28');
  });

  it('clamps leap days on year shifts', () => {
    expect(date('2024-02-29').addYears(1).format('yyyy-MM-dd')).toBe('2025-02-28');
    expect(date('2024-02-29').addYears(-4).format('yyyy-MM-dd')).toBe('2020-02-29');
  });

  it('keeps the clock riding along every shift', () => {
    expect(date('2026-03-15T08:30:05').addDays(1).format('HH:mm:ss')).toBe('08:30:05');
  });

  it('chains fluently', () => {
    expect(date('2026-03-15').addDays(2).addMonths(1).addYears(1).format('yyyy/MM/dd')).toBe(
      '2027/04/17',
    );
  });

  it('is immutable — each link returns a new instance', () => {
    const value = date('2026-03-15');
    value.addDays(1);
    expect(value.format('yyyy-MM-dd')).toBe('2026-03-15');
  });
});

describe('format token grammar', () => {
  it('renders zero-padding by token length — bare vs padded', () => {
    // yy/bare y = last two digits (the shared date-compiler convention), M/d/H/m/s bare = no padding.
    expect(date('2026-03-05T08:06:07').format('yy-M-d H:m:s')).toBe('26-3-5 8:6:7');
    expect(date('2026-03-05T08:06:07').format('yyyy-MM-dd HH:mm:ss')).toBe('2026-03-05 08:06:07');
  });

  it('carries the word by case — M is the month, m the minute', () => {
    expect(date('2026-03-05T08:06').format('MM:mm')).toBe('03:06');
  });

  it('renders the 12-hour clock through h/hh', () => {
    expect(date('2026-03-15T00:05').format('h:mm')).toBe('12:05');
    expect(date('2026-03-15T14:05').format('hh:mm')).toBe('02:05');
  });

  it('renders weekday tokens', () => {
    expect(date('2026-03-15').format('EEE')).toBe('Sun');
    expect(date('2026-03-15').format('EEEE, yyyy-MM-dd')).toBe('Sunday, 2026-03-15');
  });

  it('drops the time when the pattern has no time tokens', () => {
    expect(date('2026-03-15T08:30').format('yyyy-MM-dd')).toBe('2026-03-15');
    expect(date('2026-03-15T08:30').format('yyyy年M月d日')).toBe('2026年3月15日');
  });

  it('passes non-token characters through as literals', () => {
    expect(date('2026-03-15T08:30').format('yyyy/MM/dd HH时mm分')).toBe('2026/03/15 08时30分');
  });
});

describe('standalone format', () => {
  it('formats strings, Dates and instances without the date() detour', () => {
    expect(format('2026-03-15', 'yyyy年M月d日')).toBe('2026年3月15日');
    expect(format(new Date(2026, 2, 15, 8, 30), 'HH:mm')).toBe('08:30');
    expect(format(date('2026-03-15'), 'MM-dd')).toBe('03-15');
  });
});

describe('toDate bridge', () => {
  it('constructs the native Date at the local wall clock', () => {
    const value = date('2026-03-15T08:30:05').toDate();
    expect(value.getFullYear()).toBe(2026);
    expect(value.getMonth()).toBe(2);
    expect(value.getDate()).toBe(15);
    expect(value.getHours()).toBe(8);
    expect(value.getMinutes()).toBe(30);
    expect(value.getSeconds()).toBe(5);
  });
});

describe('parts format', () => {
  it('emits the full six-field coordinate from parts()', () => {
    expect(date('2026-03-15T08:30:05').parts()).toEqual({
      year: 2026,
      month: 3,
      day: 15,
      hour: 8,
      minute: 30,
      second: 5,
    });
  });

  it('round-trips parts back through the factory losslessly', () => {
    const value = date('2026-03-15T08:30:05');
    expect(date(value.parts()).format('yyyy-MM-dd HH:mm:ss')).toBe('2026-03-15 08:30:05');
  });

  it('accepts the parts format as input — day-only with the clock defaulting to zero', () => {
    const value = date({ year: 2026, month: 3, day: 2 });
    expect(value.format('yyyy-MM-dd HH:mm:ss')).toBe('2026-03-02 00:00:00');
    expect(value.parts()).toEqual({ year: 2026, month: 3, day: 2, hour: 0, minute: 0, second: 0 });
  });

  it('validates the parts input like any other source', () => {
    expect(() => date({ year: 2026, month: 2, day: 30 })).toThrow(TypeError);
    expect(() => date({ year: 2026, month: 13, day: 1 })).toThrow(TypeError);
    expect(() => date({ year: 2026, month: 3, day: 2, hour: 24 })).toThrow(TypeError);
  });

  it('returns a fresh object each call — mutating it cannot touch the value', () => {
    const value = date('2026-03-15');
    const parts = value.parts();
    parts.day = 99;
    expect(value.format('yyyy-MM-dd')).toBe('2026-03-15');
    expect(value.parts().day).toBe(15);
  });

  it('yields the coordinate from strings, Dates and instances without the date() detour', () => {
    expect(dateParts('2026/3/2')).toEqual({
      year: 2026,
      month: 3,
      day: 2,
      hour: 0,
      minute: 0,
      second: 0,
    });
    expect(dateParts(new Date(2026, 2, 15, 8, 30))).toEqual({
      year: 2026,
      month: 3,
      day: 15,
      hour: 8,
      minute: 30,
      second: 0,
    });
    expect(dateParts(date('2026-03-15T08:30'))).toEqual(date('2026-03-15T08:30').parts());
  });

  it('turns the honest throw into a null signal when a null fallback is given', () => {
    expect(dateParts('not a date', null)).toBeNull();
    expect(dateParts('2026-13', null)).toBeNull();
    expect(() => dateParts('not a date')).toThrow(TypeError);
  });

  it('returns the fallback coordinate untouched for unparsable sources', () => {
    const fallback = { year: 1970, month: 1, day: 1 };
    expect(dateParts('not a date', fallback)).toBe(fallback);
  });
});
