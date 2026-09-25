import { describe, expect, it } from 'vitest';
import { compilePattern, patternToParseSource } from '../format';

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
