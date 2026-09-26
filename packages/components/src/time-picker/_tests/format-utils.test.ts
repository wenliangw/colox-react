import { describe, expect, it } from 'vitest';
import { COLUMN_FOCUS_SLOT, COLUMN_STEP, COLUMN_VISIBLE } from '../constants/column';
import { TIME_DEFAULT_FORMAT } from '../constants/time';
import {
  canonicalBoundOf,
  formatTimeValue,
  isTimeDraftAllowed,
  parseTimeText,
  timePartsOf,
  wordOfParts,
} from '../utils/format';

describe('time editor format utils', () => {
  describe('parseTimeText', () => {
    it('takes the canonical word through the default pattern', () => {
      expect(parseTimeText('08:30:05', TIME_DEFAULT_FORMAT)).toBe('08:30:05');
    });

    it('takes the lenient grammar when the pattern does not fit', () => {
      expect(parseTimeText('8:30', TIME_DEFAULT_FORMAT)).toBe('08:30:00');
      expect(parseTimeText('8:3', TIME_DEFAULT_FORMAT)).toBe('08:03:00');
      expect(parseTimeText('8:30:5', TIME_DEFAULT_FORMAT)).toBe('08:30:05');
    });

    it('parses through the configured pattern tokens', () => {
      expect(parseTimeText('8.30', 'H.mm')).toBe('08:30:00');
      expect(parseTimeText('8.30.05', 'H.mm.ss')).toBe('08:30:05');
      expect(parseTimeText('08 30 05', 'HH mm ss')).toBe('08:30:05');
    });

    it('rejects a bare hour (the minute never rhymes)', () => {
      expect(parseTimeText('8', TIME_DEFAULT_FORMAT)).toBeNull();
    });

    it('rejects out-of-range and broken words', () => {
      expect(parseTimeText('25:00:00', TIME_DEFAULT_FORMAT)).toBeNull();
      expect(parseTimeText('08:60:00', TIME_DEFAULT_FORMAT)).toBeNull();
      expect(parseTimeText('08:30:60', TIME_DEFAULT_FORMAT)).toBeNull();
      expect(parseTimeText('a:b', TIME_DEFAULT_FORMAT)).toBeNull();
      expect(parseTimeText('', TIME_DEFAULT_FORMAT)).toBeNull();
    });

    it('trims surrounding whitespace before parsing', () => {
      expect(parseTimeText(' 08:30:05 ', TIME_DEFAULT_FORMAT)).toBe('08:30:05');
    });
  });

  describe('wordOfParts', () => {
    it('canonicalizes valid parts', () => {
      expect(wordOfParts({ hour: 8, minute: 30, second: 5 })).toBe('08:30:05');
    });

    it('rejects out-of-rhyme parts', () => {
      expect(wordOfParts({ hour: 30, minute: 0, second: 0 })).toBeNull();
      expect(wordOfParts(null)).toBeNull();
    });
  });

  describe('isTimeDraftAllowed', () => {
    it('admits digits and the colons with pattern literals', () => {
      expect(isTimeDraftAllowed('08:3', TIME_DEFAULT_FORMAT)).toBe(true);
      expect(isTimeDraftAllowed('8.30', 'H.mm')).toBe(true);
    });

    it('rejects junk symbols', () => {
      expect(isTimeDraftAllowed('08$30', TIME_DEFAULT_FORMAT)).toBe(false);
    });
  });

  describe('timePartsOf', () => {
    it('splits a canonical word', () => {
      expect(timePartsOf('08:30:05')).toEqual({ hour: 8, minute: 30, second: 5 });
    });

    it('tolerates the lenient spelling and defaults a missing second to 0', () => {
      expect(timePartsOf('8:3')).toEqual({ hour: 8, minute: 3, second: 0 });
      expect(timePartsOf('8:30:5')).toEqual({ hour: 8, minute: 30, second: 5 });
    });

    it('returns null for empty and broken words', () => {
      expect(timePartsOf(null)).toBeNull();
      expect(timePartsOf('')).toBeNull();
      expect(timePartsOf('garbage')).toBeNull();
      expect(timePartsOf('25:61:00')).toBeNull();
      expect(timePartsOf('08:00:60')).toBeNull();
    });
  });

  describe('formatTimeValue', () => {
    it('renders the canonical word through the pattern', () => {
      expect(formatTimeValue('08:30:05', TIME_DEFAULT_FORMAT)).toBe('08:30:05');
      expect(formatTimeValue('08:30:05', 'H:m:s')).toBe('8:30:5');
      expect(formatTimeValue('23:05:07', 'H.mm')).toBe('23.05');
      expect(formatTimeValue('08:30', 'HH:mm')).toBe('08:30');
    });

    it('renders empty for the null value', () => {
      expect(formatTimeValue(null, TIME_DEFAULT_FORMAT)).toBe('');
      expect(formatTimeValue(undefined, TIME_DEFAULT_FORMAT)).toBe('');
    });
  });

  describe('canonicalBoundOf', () => {
    it('normalizes string bounds through the clock grammar', () => {
      expect(canonicalBoundOf('08:30:05')).toBe('08:30:05');
      expect(canonicalBoundOf('8:3')).toBe('08:03:00');
    });

    it('reads a Date at the local wall clock', () => {
      const bound = new Date(2020, 6, 1, 14, 5, 42);
      expect(canonicalBoundOf(bound)).toBe('14:05:42');
    });

    it('returns null for invalid bounds so they drop out of the comparison', () => {
      expect(canonicalBoundOf(undefined)).toBeNull();
      expect(canonicalBoundOf('garbage')).toBeNull();
      expect(canonicalBoundOf(new Date(Number.NaN))).toBeNull();
    });
  });

  describe('column constants', () => {
    it('keeps the wheel window at 8 visible options with the 7-step chevron', () => {
      expect(COLUMN_VISIBLE).toBe(8);
      expect(COLUMN_STEP).toBe(7);
      // The pending option rests at slot 3: three above, four below.
      expect(COLUMN_FOCUS_SLOT).toBe(3);
    });
  });
});
