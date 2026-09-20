import { describe, expect, it } from 'vitest';
import { fromLocalDate, toLocalDate } from '../local';

describe('local calendar bridges', () => {
  it('reads a Date through the browser-local calendar wall clock', () => {
    // Constructed as local parts — the wall clock the author sees.
    expect(fromLocalDate(new Date(2026, 2, 15))).toBe('2026-03-15');
    expect(fromLocalDate(new Date(2026, 0, 1))).toBe('2026-01-01');
  });

  it('converts a canonical date value into its local calendar Date', () => {
    const date = toLocalDate('2026-03-15');
    expect(date).not.toBeNull();
    expect(date?.getFullYear()).toBe(2026);
    expect(date?.getMonth()).toBe(2);
    expect(date?.getDate()).toBe(15);
  });

  it('carries the implicit day 1 of coarser granular values', () => {
    const month = toLocalDate('2026-03');
    expect(month?.getDate()).toBe(1);
    expect(month?.getMonth()).toBe(2);
    const year = toLocalDate('2026');
    expect(year?.getDate()).toBe(1);
    expect(year?.getMonth()).toBe(0);
  });

  it('returns null for null or calendar-invalid input', () => {
    expect(toLocalDate(null)).toBeNull();
    expect(toLocalDate('2026-13-99')).toBeNull();
  });

  it('round-trips through the local wall clock', () => {
    expect(toLocalDate(fromLocalDate(new Date(2026, 2, 15)))?.getDate()).toBe(15);
  });
});
