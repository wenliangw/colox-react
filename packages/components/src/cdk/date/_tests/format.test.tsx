import { describe, expect, it } from 'vitest';
import { compilePattern, isDraftAllowed, parseDateText, patternToParseSource } from '../format';

describe('pattern compilation', () => {
  it('splits tokens from literal separators', () => {
    const parts = compilePattern('yyyy-MM-dd');
    expect(parts).toEqual([
      { type: 'year', length: 4 },
      { type: 'literal', text: '-' },
      { type: 'month', length: 2 },
      { type: 'literal', text: '-' },
      { type: 'day', length: 2 },
    ]);
  });

  it('treats token letters case-insensitively and non-key letters as literals', () => {
    const parts = compilePattern('YYYy年M月d日');
    expect(parts[0]).toEqual({ type: 'year', length: 4 });
    expect(parts[1]).toEqual({ type: 'literal', text: '年' });
    expect(parts[2]).toEqual({ type: 'month', length: 1 });
    expect(parts[3]).toEqual({ type: 'literal', text: '月' });
    expect(parts[4]).toEqual({ type: 'day', length: 1 });
    expect(parts[5]).toEqual({ type: 'literal', text: '日' });
  });

  it('materializes the parse source with non-capturing weekday slots', () => {
    expect(patternToParseSource('yyyy-MM-dd')).toBe('^(\\d{4})-(\\d{2})-(\\d{2})$');
    expect(patternToParseSource('yyyy-M-d EEE')).toBe(
      '^(\\d{4})-(\\d{1,2})-(\\d{1,2}) (?:[A-Za-z]+)$',
    );
  });
});

describe('parseDateText', () => {
  it('parses the canonical ISO grammar, strict and lenient', () => {
    expect(parseDateText('2026-03-02', 'yyyy-MM-dd', 'date')).toBe('2026-03-02');
    expect(parseDateText('2026/3/2', 'yyyy-MM-dd', 'date')).toBe('2026-03-02');
    expect(parseDateText('2026-3-2', 'yyyy/M/d', 'date')).toBe('2026-03-02');
  });

  it('parses through the configured pattern', () => {
    expect(parseDateText('2.3.2026', 'd.M.yyyy', 'date')).toBe('2026-03-02');
    expect(parseDateText('26-03-02', 'yy-MM-dd', 'date')).toBe('2026-03-02');
    expect(parseDateText('2026-03-02 Mon', 'yyyy-MM-dd EEE', 'date')).toBe('2026-03-02');
    expect(parseDateText('2026.03.02 Monday', 'yyyy.MM.dd EEEE', 'date')).toBe('2026-03-02');
  });

  it('rejects impossible calendar dates', () => {
    expect(parseDateText('2026-02-29', 'yyyy-MM-dd', 'date')).toBeNull();
    expect(parseDateText('2026-13-01', 'yyyy-MM-dd', 'date')).toBeNull();
    expect(parseDateText('2026-00-10', 'yyyy-MM-dd', 'date')).toBeNull();
    expect(parseDateText('2026-04-31', 'yyyy-MM-dd', 'date')).toBeNull();
  });

  it('returns null for garbage and partial drafts', () => {
    expect(parseDateText('', 'yyyy-MM-dd', 'date')).toBeNull();
    expect(parseDateText('2026-0', 'yyyy-MM-dd', 'date')).toBeNull();
    expect(parseDateText('2026-03-', 'yyyy-MM-dd', 'date')).toBeNull();
    expect(parseDateText('not a date', 'yyyy-MM-dd', 'date')).toBeNull();
  });

  it('ignores the weekday value — parsing never round-trips it', () => {
    expect(parseDateText('2026-3-2 Tuesday', 'yyyy-M-d EEEE', 'date')).toBe('2026-03-02');
  });

  it('commits a month picker at month precision and truncates finer text', () => {
    expect(parseDateText('2026-03', 'yyyy-MM', 'month')).toBe('2026-03');
    expect(parseDateText('2026/3', 'yyyy-MM', 'month')).toBe('2026-03');
    expect(parseDateText('2026-03-02', 'yyyy-MM', 'month')).toBe('2026-03');
    expect(parseDateText('2026', 'yyyy-MM', 'month')).toBeNull();
    expect(parseDateText('2026-13', 'yyyy-MM', 'month')).toBeNull();
  });

  it('commits a year picker at year precision and truncates finer text', () => {
    expect(parseDateText('2026', 'yyyy', 'year')).toBe('2026');
    expect(parseDateText('2026-03', 'yyyy', 'year')).toBe('2026');
    expect(parseDateText('2026-03-02', 'yyyy', 'year')).toBe('2026');
    expect(parseDateText('26', 'yy', 'year')).toBe('2026');
    expect(parseDateText('26-03', 'yy-MM', 'year')).toBe('2026');
    expect(parseDateText('26', 'yyyy', 'year')).toBeNull();
  });
});

describe('draft gate', () => {
  it('allows digits, letters and the canonical separators everywhere', () => {
    expect(isDraftAllowed('2026/3/2', 'yyyy-MM-dd')).toBe(true);
    expect(isDraftAllowed('2026-03-02 Mon', 'yyyy-MM-dd EEE')).toBe(true);
    expect(isDraftAllowed('2.3.2026', 'd.M.yyyy')).toBe(true);
  });

  it('allows the pattern literal characters', () => {
    expect(isDraftAllowed('2026年3月', 'yyyy年M月d日')).toBe(true);
  });

  it('rejects characters outside digits, letters, spaces and separators', () => {
    expect(isDraftAllowed('2026-03-02#', 'yyyy-MM-dd')).toBe(false);
    expect(isDraftAllowed('@2026', 'yyyy-MM-dd')).toBe(false);
    expect(isDraftAllowed('', 'yyyy-MM-dd')).toBe(true);
  });
});
