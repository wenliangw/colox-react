import { describe, expect, it } from 'vitest';
import {
  addMonths,
  buildMonthGrid,
  buildMonthViewCells,
  buildYearViewCells,
  civilFromDays,
  daysFromCivil,
  daysInMonth,
  decadeOf,
  granularIsoOf,
  isLeapYear,
  isValidDate,
  isoToParts,
  parseGranularIso,
  partsToGranularIso,
  partsToIso,
  weekdayOfParts,
} from '../utils/date-core';

describe('date-core calendar math', () => {
  it('knows leap years and month lengths', () => {
    expect(isLeapYear(2024)).toBe(true);
    expect(isLeapYear(2026)).toBe(false);
    expect(isLeapYear(2000)).toBe(true);
    expect(isLeapYear(1900)).toBe(false);
    expect(daysInMonth(2026, 2)).toBe(28);
    expect(daysInMonth(2024, 2)).toBe(29);
    expect(daysInMonth(2026, 6)).toBe(30);
  });

  it('round-trips civil dates through day numbers in both directions', () => {
    for (const iso of ['1970-01-01', '2026-03-02', '2000-02-29', '0001-01-01', '9999-12-31']) {
      const parts = isoToParts(iso);
      expect(parts).not.toBeNull();
      expect(partsToIso(civilFromDays(daysFromCivil(parts!)))).toBe(iso);
    }
  });

  it('derives Monday-first weekdays', () => {
    // 2026-03-02 is a Monday; 1970-01-01 was a Thursday (index 3).
    expect(weekdayOfParts({ year: 2026, month: 3, day: 2 })).toBe(0);
    expect(weekdayOfParts({ year: 1970, month: 1, day: 1 })).toBe(3);
    expect(weekdayOfParts({ year: 2026, month: 3, day: 8 })).toBe(6);
  });
});

describe('month grid', () => {
  it('starts the grid on the Monday at or before the 1st', () => {
    // March 2026: the 1st is a Sunday, so the grid window starts 2026-02-23.
    const grid = buildMonthGrid(2026, 3);
    expect(grid).toHaveLength(42);
    expect(grid[0].iso).toBe('2026-02-23');
    expect(grid[0].inMonth).toBe(false);
    expect(grid[0].day).toBe(23);
  });

  it('marks in-month cells and fills the tail from the next month', () => {
    const grid = buildMonthGrid(2026, 2);
    const flags = grid.map(({ inMonth }) => inMonth);
    expect(flags.filter(Boolean)).toHaveLength(28);
    expect(grid[flags.indexOf(true)].day).toBe(1);
    expect(grid[grid.length - 1].inMonth).toBe(false);
  });

  it('never leaks adjacent months into the visible labels', () => {
    for (const [year, month] of [
      [2026, 1],
      [2026, 12],
      [2024, 2],
      [1900, 2],
    ] as const) {
      const grid = buildMonthGrid(year, month);
      const owned = grid.filter(({ inMonth }) => inMonth);
      expect(owned.map(({ day }) => day)).toEqual(
        Array.from({ length: daysInMonth(year, month) }, (_, i) => i + 1),
      );
    }
  });
});

describe('month shifting and bounds', () => {
  it('clamps the day into the target month', () => {
    expect(addMonths({ year: 2026, month: 1, day: 31 }, 1)).toEqual({
      year: 2026,
      month: 2,
      day: 28,
    });
    expect(addMonths({ year: 2024, month: 1, day: 31 }, 1)).toEqual({
      year: 2024,
      month: 2,
      day: 29,
    });
  });

  it('crosses year boundaries in both directions', () => {
    expect(addMonths({ year: 2026, month: 1, day: 15 }, -1)).toEqual({
      year: 2025,
      month: 12,
      day: 15,
    });
    expect(addMonths({ year: 2026, month: 12, day: 15 }, 1)).toEqual({
      year: 2027,
      month: 1,
      day: 15,
    });
  });

  it('rejects impossible calendar dates', () => {
    expect(isValidDate({ year: 2026, month: 2, day: 29 })).toBe(false);
    expect(isValidDate({ year: 2026, month: 13, day: 1 })).toBe(false);
    expect(isValidDate({ year: 2026, month: 4, day: 31 })).toBe(false);
    expect(isValidDate({ year: 2024, month: 2, day: 29 })).toBe(true);
  });

  it('turns parts into padded canonical ISO', () => {
    expect(partsToIso({ year: 2026, month: 3, day: 2 })).toBe('2026-03-02');
    expect(isoToParts('2026-03-02')).toEqual({ year: 2026, month: 3, day: 2 });
    expect(isoToParts('2026-3-2')).toBeNull();
  });
});

describe('granularity values and views', () => {
  it('parses granularity ISOs, filling missing month/day as 1', () => {
    expect(parseGranularIso('2026')).toEqual({ year: 2026, month: 1, day: 1 });
    expect(parseGranularIso('2026-03')).toEqual({ year: 2026, month: 3, day: 1 });
    expect(parseGranularIso('2026-03-02')).toEqual({ year: 2026, month: 3, day: 2 });
    expect(parseGranularIso('2026-13')).toBeNull();
    expect(parseGranularIso('2026-3')).toBeNull();
    expect(parseGranularIso('26')).toBeNull();
    expect(parseGranularIso('2026-03-02-04')).toBeNull();
  });

  it('canonicalizes parts to the picker granularity', () => {
    const parts = { year: 2026, month: 3, day: 2 };
    expect(partsToGranularIso(parts, 'date')).toBe('2026-03-02');
    expect(partsToGranularIso(parts, 'month')).toBe('2026-03');
    expect(partsToGranularIso(parts, 'year')).toBe('2026');
  });

  it('derives the current cell at the picker granularity', () => {
    expect(granularIsoOf('2026-03-02', 'date')).toBe('2026-03-02');
    expect(granularIsoOf('2026-03-02', 'month')).toBe('2026-03');
    expect(granularIsoOf('2026-03-02', 'year')).toBe('2026');
  });

  it('builds the 12-month and 12-year grids', () => {
    const months = buildMonthViewCells(2026);
    expect(months).toHaveLength(12);
    expect(months[0]).toEqual({ iso: '2026-01', month: 1 });
    expect(months[11]).toEqual({ iso: '2026-12', month: 12 });

    const years = buildYearViewCells(2020);
    expect(years).toHaveLength(12);
    expect(years[0]).toEqual({ iso: '2020', year: 2020 });
    expect(years[11]).toEqual({ iso: '2031', year: 2031 });
  });

  it('places years into decades', () => {
    expect(decadeOf(2026)).toBe(2020);
    expect(decadeOf(2020)).toBe(2020);
    expect(decadeOf(2031)).toBe(2030);
  });
});
