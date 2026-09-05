import { describe, expect, it } from 'vitest';
import { resolveResponsiveGap } from '../context';

describe('resolveResponsiveGap', () => {
  it('serves the base value outside any capped band', () => {
    expect(resolveResponsiveGap({ base: '2', md: '8' }, 'base')).toBe('2');
  });

  it('uses the exact band value when configured', () => {
    expect(resolveResponsiveGap({ base: '2', md: '8' }, 'md')).toBe('8');
  });

  it('uses the narrowest configured band the viewport still fits', () => {
    // md caps at 768px: at band sm the viewport fits the md cap too, so md wins.
    expect(resolveResponsiveGap({ base: '2', md: '8' }, 'sm')).toBe('8');
  });

  it('skips narrower configured bands the viewport already passed', () => {
    // sm caps at 640px: at band md the viewport is beyond sm, so base wins.
    expect(resolveResponsiveGap({ base: '2', sm: '1' }, 'md')).toBe('2');
  });

  it('falls back to base when the band region is bare', () => {
    expect(resolveResponsiveGap({ base: '2', sm: '1' }, 'lg')).toBe('2');
  });

  it('returns undefined when nothing is configured', () => {
    expect(resolveResponsiveGap({}, 'md')).toBeUndefined();
  });
});
