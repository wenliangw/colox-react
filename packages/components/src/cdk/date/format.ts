import type { DateFormatPart } from './types';
import { TOKEN_TYPES } from './constants/format';

const isTokenLetter = (char: string): boolean => char.toLowerCase() in TOKEN_TYPES;

/**
 * Compiles a `valueFormat` pattern into literal/token parts. Letters
 * `y`/`m`/`d`/`e` (case-insensitive) are tokens — consecutive runs of
 * the same letter carry one length (`yyyy` = 4, `MM` = 2); every other
 * character is a literal separator. Weekday tokens are display-only.
 */
export const compilePattern = (pattern: string): DateFormatPart[] => {
  const parts: DateFormatPart[] = [];
  let index = 0;
  while (index < pattern.length) {
    const lower = pattern[index].toLowerCase();
    if (isTokenLetter(pattern[index])) {
      let end = index;
      while (end < pattern.length && pattern[end].toLowerCase() === lower) {
        end += 1;
      }
      parts.push({ type: TOKEN_TYPES[lower as keyof typeof TOKEN_TYPES], length: end - index });
      index = end;
    } else {
      let end = index;
      while (end < pattern.length && !isTokenLetter(pattern[end])) {
        end += 1;
      }
      parts.push({ type: 'literal', text: pattern.slice(index, end) });
      index = end;
    }
  }
  return parts;
};

const escapeLiteral = (text: string): string => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const tokenParseSource = (part: Extract<DateFormatPart, { type: string }>): string | null => {
  switch (part.type) {
    case 'year':
      return part.length <= 2 ? '(\\d{2})' : '(\\d{4})';
    case 'month':
    case 'day':
      return part.length === 1 ? '(\\d{1,2})' : `(\\d{${part.length}})`;
    case 'weekday':
      return '(?:[A-Za-z]+)';
    default:
      return null;
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
