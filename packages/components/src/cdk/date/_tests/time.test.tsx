import { describe, expect, it } from 'vitest';
import {
  buildTimeOptions,
  formatTime,
  isValidTime,
  parseTimeText,
  partsToTimeIso,
  TIME_DEFAULT_FORMAT,
} from '../time';

describe('time parse', () => {
  it('accepts the strict zero-padded grammar', () => {
    expect(parseTimeText('14:30')).toBe('14:30');
    expect(parseTimeText('00:00')).toBe('00:00');
    expect(parseTimeText('23:59')).toBe('23:59');
  });

  it('normalizes the lenient H:m spelling to canonical', () => {
    expect(parseTimeText('9:5')).toBe('09:05');
    expect(parseTimeText(' 9:05 ')).toBe('09:05');
  });

  it('rejects clock-invalid and malformed text', () => {
    expect(parseTimeText('24:00')).toBeNull();
    expect(parseTimeText('12:60')).toBeNull();
    expect(parseTimeText('12')).toBeNull();
    expect(parseTimeText('12:30:00')).toBeNull();
    expect(parseTimeText('noon')).toBeNull();
  });
});

describe('time format', () => {
  it('renders the default HH:mm pattern', () => {
    expect(formatTime('09:05')).toBe('09:05');
    expect(TIME_DEFAULT_FORMAT).toBe('HH:mm');
  });

  it('renders the token vocabulary — H/HH 24h, h/hh 12h, mm minutes', () => {
    expect(formatTime('14:05', 'H:mm')).toBe('14:05');
    expect(formatTime('00:05', 'h:mm')).toBe('12:05');
    expect(formatTime('14:05', 'hh:mm')).toBe('02:05');
    expect(formatTime('09:05', 'HH 时 mm 分')).toBe('09 时 05 分');
  });

  it('renders the empty string for null or unparsable values', () => {
    expect(formatTime(null)).toBe('');
    expect(formatTime('25:00')).toBe('');
  });
});

describe('time parts', () => {
  it('validates the clock bounds', () => {
    expect(isValidTime({ hour: 0, minute: 0 })).toBe(true);
    expect(isValidTime({ hour: 23, minute: 59 })).toBe(true);
    expect(isValidTime({ hour: 24, minute: 0 })).toBe(false);
    expect(isValidTime({ hour: 12, minute: 60 })).toBe(false);
    expect(isValidTime({ hour: -1, minute: 0 })).toBe(false);
  });

  it('pads the canonical rendering', () => {
    expect(partsToTimeIso({ hour: 9, minute: 5 })).toBe('09:05');
    expect(partsToTimeIso({ hour: 23, minute: 0 })).toBe('23:00');
  });
});

describe('time column options', () => {
  it('lists the zero-padded hour and minute columns', () => {
    const hours = buildTimeOptions('hour');
    expect(hours).toHaveLength(24);
    expect(hours[0]).toBe('00');
    expect(hours[23]).toBe('23');
    const minutes = buildTimeOptions('minute');
    expect(minutes).toHaveLength(60);
    expect(minutes[0]).toBe('00');
    expect(minutes[59]).toBe('59');
  });
});
