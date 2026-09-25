import { WEEKDAY_FULL, WEEKDAY_SHORT } from './constants/calendar';
import { TOKEN_TYPES } from './constants/format';
import { weekdayOf } from './calendar';
import type { DateFormatPart, DateTimeParts, PatternTokenType } from './types';

/**
 * The combined date/time token vocabulary. Case carries the word for
 * `M`/`m` (month vs minute) and `H`/`h` (24-hour vs 12-hour); every
 * other token letter is case-insensitive. Token length drives the
 * zero-padding (`M` bare, `MM` padded) — the single grammar every
 * date rendering and parsing lives by.
 */

const pad = (value: number, length: number): string =>
  length <= 1 ? String(value) : String(value).padStart(length, '0');

const tokenLetter = (char: string): PatternTokenType | null => {
  const direct = (TOKEN_TYPES as Record<string, string>)[char];
  if (direct !== undefined) {
    return direct as PatternTokenType;
  }
  return ((TOKEN_TYPES as Record<string, string>)[char.toLowerCase()] as PatternTokenType) ?? null;
};

/** Month/minute/hour tokens carry their word in the letter case — runs stay case-exact for them. */
const CASE_SENSITIVE = new Set(['month', 'minute', 'hour24', 'hour12']);

/**
 * Compiles a pattern into literal/token parts. Consecutive runs of
 * one token carry one length (`yyyy` = 4, `MM` = 2); letters outside
 * the alphabet are literal separators. Weekday tokens are display
 * only.
 */
export const compilePattern = (pattern: string): DateFormatPart[] => {
  const parts: DateFormatPart[] = [];
  let index = 0;
  while (index < pattern.length) {
    const type = tokenLetter(pattern[index]);
    if (type !== null) {
      let end = index + 1;
      while (
        end < pattern.length &&
        tokenLetter(pattern[end]) === type &&
        (!CASE_SENSITIVE.has(type) || pattern[end] === pattern[index])
      ) {
        end += 1;
      }
      parts.push({ type, length: end - index } as DateFormatPart);
      index = end;
    } else {
      let end = index;
      while (end < pattern.length && tokenLetter(pattern[end]) === null) {
        end += 1;
      }
      parts.push({ type: 'literal', text: pattern.slice(index, end) });
      index = end;
    }
  }
  return parts;
};

const escapeLiteral = (text: string): string => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const tokenParseSource = (part: DateFormatPart): string | null => {
  if (part.type === 'literal') {
    return null;
  }
  switch (part.type) {
    case 'year':
      return part.length <= 2 ? '(\\d{2})' : '(\\d{4})';
    case 'month':
    case 'day':
    case 'hour24':
    case 'hour12':
    case 'minute':
    case 'second':
      return part.length === 1 ? '(\\d{1,2})' : `(\\d{${part.length}})`;
    case 'weekday':
      return '(?:[A-Za-z]+)';
  }
};

/**
 * Builds a parse source from the pattern: token positions capture
 * their digits, weekday tokens match-and-discard (display-only),
 * literals are escaped. Used to accept the configured `valueFormat`
 * alongside the canonical ISO grammar — never to define valid dates.
 */
export const patternToParseSource = (pattern: string): string => {
  let source = '^';
  const parts = compilePattern(pattern);
  for (const part of parts) {
    source += part.type === 'literal' ? escapeLiteral(part.text) : (tokenParseSource(part) ?? '');
  }
  return `${source}$`;
};

const renderPart = (part: DateFormatPart, parts: DateTimeParts): string => {
  if (part.type === 'literal') {
    return part.text;
  }
  switch (part.type) {
    case 'year': {
      const text = String(parts.year);
      return part.length <= 2 ? text.slice(-2).padStart(part.length, '0') : text.padStart(4, '0');
    }
    case 'month':
      return pad(parts.month, part.length);
    case 'day':
      return pad(parts.day, part.length);
    case 'weekday': {
      const names = part.length >= 4 ? WEEKDAY_FULL : WEEKDAY_SHORT;
      return names[weekdayOf(parts)];
    }
    case 'hour24':
      return pad(parts.hour, part.length);
    case 'hour12':
      return pad(parts.hour % 12 || 12, part.length);
    case 'minute':
      return pad(parts.minute, part.length);
    case 'second':
      return pad(parts.second, part.length);
  }
};

/** Renders coordinates through the token pattern — the sole pattern grammar. */
export const renderPattern = (parts: DateTimeParts, pattern: string): string =>
  compilePattern(pattern)
    .map((part) => renderPart(part, parts))
    .join('');
