import { describe, expect, it } from 'vitest';
import {
  MONTH_LABELS_ZH,
  WEEKDAY_LABELS_ZH,
  composeDecade,
  composeYear,
  composeYearMonth,
  resolveDateLocale,
} from '../utils/locale';

describe('panel chrome locale', () => {
  it('defaults to the Chinese panel chrome', () => {
    expect(MONTH_LABELS_ZH).toHaveLength(12);
    expect(WEEKDAY_LABELS_ZH).toEqual(['一', '二', '三', '四', '五', '六', '日']);
    expect(resolveDateLocale(undefined).yearMonthFormat).toBe('{year}年{month}');
    expect(resolveDateLocale(undefined).yearFormat).toBe('{year}年');
    expect(resolveDateLocale(undefined).decadeFormat).toBe('{start}–{end}年');
  });

  it('fills only the missing locale fields', () => {
    const resolved = resolveDateLocale({ yearMonthFormat: '{month} {year}' });
    expect(resolved.yearMonthFormat).toBe('{month} {year}');
    expect(resolved.months).toBe(MONTH_LABELS_ZH);
    expect(resolved.weekdays).toBe(WEEKDAY_LABELS_ZH);
  });

  it('never mutates the caller locale object', () => {
    const custom = { months: ['Jan', 'Feb'] as string[] };
    resolveDateLocale(custom);
    expect(custom.months).toHaveLength(2);
  });

  it('composes the Chinese year-month title', () => {
    const locale = resolveDateLocale(undefined);
    expect(composeYearMonth(2026, 3, locale)).toBe('2026年3月');
    expect(composeYearMonth(2026, 12, locale)).toBe('2026年12月');
  });

  it('composes the month-view year title and the year-view decade title', () => {
    const locale = resolveDateLocale(undefined);
    expect(composeYear(2026, locale)).toBe('2026年');
    expect(composeDecade(2020, locale)).toBe('2020–2031年');
    const custom = resolveDateLocale({ decadeFormat: '{start} - {end}' });
    expect(composeDecade(2020, custom)).toBe('2020 - 2031');
  });

  it('composes through a custom pattern and labels', () => {
    const locale = resolveDateLocale({
      months: [
        'January',
        'February',
        'March',
        'April',
        'May',
        'June',
        'July',
        'August',
        'September',
        'October',
        'November',
        'December',
      ],
      yearMonthFormat: '{month} {year}',
    });
    expect(composeYearMonth(2026, 3, locale)).toBe('March 2026');
  });

  it('passes unknown placeholder text through untouched', () => {
    const locale = resolveDateLocale({ yearMonthFormat: '{year}/{month}' });
    expect(composeYearMonth(2026, 3, locale)).toBe('2026/3月');
    const weird = resolveDateLocale({ yearMonthFormat: 'plain' });
    expect(composeYearMonth(2026, 3, weird)).toBe('plain');
  });
});
