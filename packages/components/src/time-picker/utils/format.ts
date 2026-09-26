import { dateFormat } from '@colox/cdk/date';
import { compilePattern, patternToParseSource } from '@colox/cdk/date/format';
import { TIME_DEFAULT_FORMAT } from '../constants/time';
import type { TimeParts } from '../types';

const TIME_LENIENT = /^(\d{1,2}):(\d{1,2})(?::(\d{1,2}))?$/;

/** The zero-padded two-digit spelling (7 → '07'). */
export const pad = (value: number): string => String(value).padStart(2, '0');

/** The non-negative remainder — the shared cyclic-wrap arithmetic of the columns. */
export const mod = (value: number, count: number): number => ((value % count) + count) % count;

/** Parses a text against a pattern — hour/minute/second tokens land, other tokens discard. */
const parseByPattern = (text: string, pattern: string): TimeParts | null => {
  const parts = compilePattern(pattern);
  const regex = new RegExp(patternToParseSource(pattern));
  const match = regex.exec(text);
  if (match === null) {
    return null;
  }
  let hour: number | undefined;
  let minute: number | undefined;
  let second: number | undefined;
  let group = 1;
  for (const part of parts) {
    if (part.type === 'literal' || part.type === 'weekday') {
      continue;
    }
    const value = Number(match[group]);
    group += 1;
    if (part.type === 'hour24' || part.type === 'hour12') {
      hour = value;
    } else if (part.type === 'minute') {
      minute = value;
    } else if (part.type === 'second') {
      second = value;
    }
    // calendar tokens capture-and-discard — the picker edits time words only
  }
  if (hour === undefined || minute === undefined) {
    return null;
  }
  return { hour, minute, second: second ?? 0 };
};

/**
 * Canonicalizes parts when all three rhyme into a valid clock word.
 * The public spelling — the hook builds pending/merge words with it.
 */
export const wordOfParts = (parts: TimeParts | null): string | null => {
  if (parts === null) {
    return null;
  }
  if (!Number.isInteger(parts.hour) || parts.hour < 0 || parts.hour > 23) {
    return null;
  }
  if (!Number.isInteger(parts.minute) || parts.minute < 0 || parts.minute > 59) {
    return null;
  }
  if (!Number.isInteger(parts.second) || parts.second < 0 || parts.second > 59) {
    return null;
  }
  return `${pad(parts.hour)}:${pad(parts.minute)}:${pad(parts.second)}`;
};

/**
 * Parses typed text into the canonical `HH:mm:ss` word (or null): the
 * configured `valueFormat` pattern first, then the lenient clock
 * grammar (`H:mm`, `HH:mm`, `H:mm:ss`, `HH:mm:ss` — hour ≤ 23, minute
 * ≤ 59, second ≤ 59, a missing second defaults to 0). A draft commits
 * only when the hour and the minute rhyme — a bare hour never
 * commits.
 */
export const parseTimeText = (text: string, pattern: string): string | null => {
  const trimmed = text.trim();
  const fromPattern = wordOfParts(parseByPattern(trimmed, pattern));
  if (fromPattern !== null) {
    return fromPattern;
  }
  const lenient = TIME_LENIENT.exec(trimmed);
  if (lenient !== null) {
    return wordOfParts({
      hour: Number(lenient[1]),
      minute: Number(lenient[2]),
      second: lenient[3] === undefined ? 0 : Number(lenient[3]),
    });
  }
  return null;
};

/**
 * The permissive draft gate: digits, spaces, dots, the colon, the
 * pattern's literal characters and letters — rejected keystrokes keep
 * the previous draft; the strict parse happens at commit/blur.
 */
export const isTimeDraftAllowed = (text: string, pattern: string): boolean => {
  const allowed = new Set('0123456789:. ');
  for (const part of compilePattern(pattern)) {
    if (part.type === 'literal') {
      for (const char of part.text) {
        allowed.add(char);
      }
    }
  }
  for (const char of 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ') {
    allowed.add(char);
  }
  return [...text].every((char) => allowed.has(char));
};

/**
 * The hour/minute/second coordinates of a word ('08:30:05', tolerant
 * '8:30'); null when off-rhyme. A missing second defaults to 0.
 */
export const timePartsOf = (word: string | null | undefined): TimeParts | null => {
  if (word === null || word === undefined || word.trim() === '') {
    return null;
  }
  const [hourText, minuteText, secondText] = word.trim().split(':');
  const hour = Number(hourText);
  const minute = Number(minuteText ?? 0);
  const second = Number(secondText ?? 0);
  if (!Number.isInteger(hour) || hour < 0 || hour > 23) {
    return null;
  }
  if (!Number.isInteger(minute) || minute < 0 || minute > 59) {
    return null;
  }
  if (!Number.isInteger(second) || second < 0 || second > 59) {
    return null;
  }
  return { hour, minute, second };
};

/** Renders a word through the display pattern ('' for the empty value). */
export const formatTimeValue = (word: string | null | undefined, pattern: string): string => {
  const parts = timePartsOf(word);
  if (parts === null) {
    return '';
  }
  return dateFormat({ year: 1970, month: 1, day: 1, ...parts }, pattern) ?? '';
};

/**
 * Normalizes a bound to the canonical word: strings parse through the
 * clock grammar, Dates read the local wall-clock hh/mm/ss. Invalid
 * bounds return null and drop out of the comparison.
 */
export const canonicalBoundOf = (bound: string | Date | undefined): string | null => {
  if (bound === undefined) {
    return null;
  }
  if (bound instanceof Date) {
    if (Number.isNaN(bound.getTime())) {
      return null;
    }
    return `${pad(bound.getHours())}:${pad(bound.getMinutes())}:${pad(bound.getSeconds())}`;
  }
  return parseTimeText(bound, TIME_DEFAULT_FORMAT);
};
