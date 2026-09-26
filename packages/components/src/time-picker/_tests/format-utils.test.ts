import { describe, expect, it } from 'vitest';
import {
  anchorAround,
  canonicalBoundOf,
  formatTimeValue,
  isTimeDraftAllowed,
  parseTimeText,
  timePartsOf,
  visibleOptions,
} from '../utils/format';

describe('time editor format utils', () => {
  describe('parseTimeText', () => {
    it('takes the canonical word through the default pattern', () => {
      expect(parseTimeText('08:30', 'HH:mm')).toBe('08:30');
    });

    it('takes the lenient grammar when the pattern does not fit', () => {
      expect(parseTimeText('8:30', 'HH:mm')).toBe('08:30');
      expect(parseTimeText('8:3', 'HH:mm')).toBe('08:03');
    });

    it('parses through the configured pattern tokens', () => {
      expect(parseTimeText('8.30', 'H.mm')).toBe('08:30');
      expect(parseTimeText('08 30', 'HH mm')).toBe('08:30');
    });

    it('rejects a bare hour (the minute never rhymes)', () => {
      expect(parseTimeText('8', 'HH:mm')).toBeNull();
    });

    it('rejects out-of-range and broken words', () => {
      expect(parseTimeText('25:00', 'HH:mm')).toBeNull();
      expect(parseTimeText('08:60', 'HH:mm')).toBeNull();
      expect(parseTimeText('a:b', 'HH:mm')).toBeNull();
      expect(parseTimeText('', 'HH:mm')).toBeNull();
    });

    it('trims surrounding whitespace before parsing', () => {
      expect(parseTimeText(' 08:30 ', 'HH:mm')).toBe('08:30');
    });
  });

  describe('isTimeDraftAllowed', () => {
    it('admits digits and the colon with pattern literals', () => {
      expect(isTimeDraftAllowed('08:3', 'HH:mm')).toBe(true);
      expect(isTimeDraftAllowed('8.30', 'H.mm')).toBe(true);
    });

    it('rejects junk symbols', () => {
      expect(isTimeDraftAllowed('08$30', 'HH:mm')).toBe(false);
    });
  });

  describe('timePartsOf', () => {
    it('splits a canonical word', () => {
      expect(timePartsOf('08:30')).toEqual({ hour: 8, minute: 30 });
    });

    it('tolerates the lenient spelling', () => {
      expect(timePartsOf('8:3')).toEqual({ hour: 8, minute: 3 });
    });

    it('returns null for empty and broken words', () => {
      expect(timePartsOf(null)).toBeNull();
      expect(timePartsOf('')).toBeNull();
      expect(timePartsOf('garbage')).toBeNull();
      expect(timePartsOf('25:61')).toBeNull();
    });
  });

  describe('formatTimeValue', () => {
    it('renders the canonical word through the pattern', () => {
      expect(formatTimeValue('08:30', 'HH:mm')).toBe('08:30');
      expect(formatTimeValue('08:30', 'H:m')).toBe('8:30');
      expect(formatTimeValue('23:05', 'H.mm')).toBe('23.05');
    });

    it('renders empty for the null value', () => {
      expect(formatTimeValue(null, 'HH:mm')).toBe('');
      expect(formatTimeValue(undefined, 'HH:mm')).toBe('');
    });
  });

  describe('canonicalBoundOf', () => {
    it('normalizes string bounds through the clock grammar', () => {
      expect(canonicalBoundOf('08:30')).toBe('08:30');
      expect(canonicalBoundOf('8:3')).toBe('08:03');
    });

    it('reads a Date at the local wall clock', () => {
      const bound = new Date(2020, 6, 1, 14, 5, 42);
      expect(canonicalBoundOf(bound)).toBe('14:05');
    });

    it('returns null for invalid bounds so they drop out of the comparison', () => {
      expect(canonicalBoundOf(undefined)).toBeNull();
      expect(canonicalBoundOf('garbage')).toBeNull();
      expect(canonicalBoundOf(new Date(Number.NaN))).toBeNull();
    });
  });

  describe('window math', () => {
    it('anchorAround seats the option at the fixed slot (3 above, 4 below)', () => {
      expect(anchorAround(8)).toBe(5);
      expect(anchorAround(0)).toBe(-3);
    });

    it('visibleOptions lists the 8 unwrapped offsets', () => {
      expect(visibleOptions(5)).toEqual([5, 6, 7, 8, 9, 10, 11, 12]);
      expect(visibleOptions(-3)).toEqual([-3, -2, -1, 0, 1, 2, 3, 4]);
    });
  });
});
