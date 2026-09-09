import { describe, expect, it } from 'vitest';
import { resolveResponsiveValue } from '../../src';

describe('resolveResponsiveValue', () => {
  it('returns a plain value unchanged (static values pass through)', () => {
    expect(resolveResponsiveValue('4', 'base')).toBe('4');
    expect(resolveResponsiveValue('4', 'md')).toBe('4');
  });

  it('activates a configured band from itself upward', () => {
    expect(resolveResponsiveValue({ sm: '2', md: '8' }, 'md')).toBe('8');
  });

  it('passes narrow bands the fallback before the first configured band', () => {
    expect(resolveResponsiveValue({ md: '8' }, 'sm', '2')).toBe('2');
  });

  it('ladders over unconfigured middle bands (sm applies until the next key)', () => {
    expect(resolveResponsiveValue({ sm: '1', lg: '12' }, 'md')).toBe('1');
  });

  it('keeps the last configured band for wider bands without their own value', () => {
    expect(resolveResponsiveValue({ sm: '2', md: '8' }, 'lg')).toBe('8');
  });

  it('keeps the last configured band beyond the widest cap (base state)', () => {
    expect(resolveResponsiveValue({ sm: '2', md: '8' }, 'base')).toBe('8');
  });

  it('returns undefined when nothing is configured and no fallback is given', () => {
    expect(resolveResponsiveValue({}, 'md')).toBeUndefined();
  });

  it('returns the fallback when nothing is configured and one is given', () => {
    expect(resolveResponsiveValue({}, 'md', '2')).toBe('2');
  });

  it('passes a falsey static value through without object detection', () => {
    expect(resolveResponsiveValue(0, 'md')).toBe(0);
  });
});
