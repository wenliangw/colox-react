import { dateFormat } from '@colox/cdk/date';
import { compilePattern, patternToParseSource } from '@colox/cdk/date/format';
import type { TimeParts } from '../types';

/** The default display pattern — the canonical word shape. */
export const TIME_DEFAULT_FORMAT = 'HH:mm';

/** The hour/minute cycle sizes (both columns wrap). */
export const HOUR_COUNT = 24;
export const MINUTE_COUNT = 60;

/** The visible option count per column window. */
export const COLUMN_VISIBLE = 8;

/**
 * The arrow-button scroll step: a full window minus one — the
 * adjacent window keeps exactly one option in common, so a 60-minute
 * column needs 9 clicks to walk a lap (8/9ths overlap per step).
 */
export const COLUMN_STEP = 7;

/** The fixed slot (0-based) the selected/anchored option occupies. */
export const ANCHOR_SLOT = 3;

const TIME_LENIENT = /^(\d{1,2}):(\d{1,2})$/;

const pad = (value: number): string => String(value).padStart(2, '0');

/** Parses a text against a pattern — hour/minute tokens land, other tokens discard. */
const parseByPattern = (text: string, pattern: string): TimeParts | null => {
  const parts = compilePattern(pattern);
  const regex = new RegExp(patternToParseSource(pattern));
  const match = regex.exec(text);
  if (match === null) {
    return null;
  }
  let hour: number | undefined;
  let minute: number | undefined;
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
    }
    // calendar tokens capture-and-discard — the picker edits time words only
  }
  if (hour === undefined || minute === undefined) {
    return null;
  }
  return { hour, minute };
};

/** Canonicalizes parts when both rhyme into a valid clock word. */
const wordOf = (parts: TimeParts | null): string | null => {
  if (parts === null) {
    return null;
  }
  if (!Number.isInteger(parts.hour) || parts.hour < 0 || parts.hour > 23) {
    return null;
  }
  if (!Number.isInteger(parts.minute) || parts.minute < 0 || parts.minute > 59) {
    return null;
  }
  return `${pad(parts.hour)}:${pad(parts.minute)}`;
};

/**
 * Parses typed text into the canonical `HH:mm` word (or null): the
 * configured `valueFormat` pattern first, then the lenient clock
 * grammar (`H:mm`, `HH:mm`, hour ≤ 23, minute ≤ 59). A draft commits
 * only when both the hour and the minute rhyme — a bare hour never
 * commits.
 */
export const parseTimeText = (text: string, pattern: string): string | null => {
  const trimmed = text.trim();
  const fromPattern = wordOf(parseByPattern(trimmed, pattern));
  if (fromPattern !== null) {
    return fromPattern;
  }
  const lenient = TIME_LENIENT.exec(trimmed);
  if (lenient !== null) {
    return wordOf({ hour: Number(lenient[1]), minute: Number(lenient[2]) });
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

/** The hour/minute coordinates of a word ('08:30', tolerant '8:30'); null when off-rhyme. */
export const timePartsOf = (word: string | null | undefined): TimeParts | null => {
  if (word === null || word === undefined || word.trim() === '') {
    return null;
  }
  const [hourText, minuteText] = word.trim().split(':');
  const hour = Number(hourText);
  const minute = Number(minuteText ?? 0);
  if (!Number.isInteger(hour) || hour < 0 || hour > 23) {
    return null;
  }
  if (!Number.isInteger(minute) || minute < 0 || minute > 59) {
    return null;
  }
  return { hour, minute };
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
 * clock grammar, Dates read the local wall-clock hour/minute. Invalid
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
    return `${pad(bound.getHours())}:${pad(bound.getMinutes())}`;
  }
  return parseTimeText(bound, TIME_DEFAULT_FORMAT);
};

/**
 * The window anchor that seats an option at the fixed anchor slot:
 * anchor + ANCHOR_SLOT = value (the window shows three options above
 * it and four below).
 */
export const anchorAround = (value: number, slot: number = ANCHOR_SLOT): number => value - slot;

/** The visible option offsets of a window (unwrapped — render maps mod count). */
export const visibleOptions = (anchor: number, size: number = COLUMN_VISIBLE): number[] =>
  Array.from({ length: size }, (_, index) => anchor + index);
