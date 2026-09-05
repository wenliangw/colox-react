import { describe, expect, it } from 'vitest';
import { resolveResponsiveValue } from '../../src';

describe('resolveResponsiveValue', () => {
  it('returns a plain value unchanged (static values pass through)', () => {
    expect(resolveResponsiveValue('4', 'base')).toBe('4');
    expect(resolveResponsiveValue('4', 'md')).toBe('4');
  });

  it('serves the base value outside any capped band', () => {
    expect(resolveResponsiveValue({ base: '2', md: '8' }, 'base')).toBe('2');
  });

  it('uses the exact band value when configured', () => {
    expect(resolveResponsiveValue({ base: '2', md: '8' }, 'md')).toBe('8');
  });

  it('uses the narrowest configured band the viewport still fits', () => {
    // md caps at 768px: at band sm the viewport fits the md cap too, so md wins.
    expect(resolveResponsiveValue({ base: '2', md: '8' }, 'sm')).toBe('8');
  });

  it('skips narrower configured bands the viewport already passed', () => {
    // sm caps at 640px: at band md the viewport is beyond sm, so base wins.
    expect(resolveResponsiveValue({ base: '2', sm: '1' }, 'md')).toBe('2');
  });

  it('falls back to base when the band region is bare', () => {
    expect(resolveResponsiveValue({ base: '2', sm: '1' }, 'lg')).toBe('2');
  });

  it('returns undefined when nothing is configured', () => {
    expect(resolveResponsiveValue({}, 'md')).toBeUndefined();
  });

  it('passes a falsey static value through without object detection', () => {
    expect(resolveResponsiveValue(0, 'md')).toBe(0);
  });
});
