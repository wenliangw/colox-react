/** The pattern-letter alphabet: case carries the word for `M`/`m` (month vs minute) and `H`/`h` (24-hour vs 12-hour). */
export const TOKEN_TYPES = {
  y: 'year',
  d: 'day',
  e: 'weekday',
  s: 'second',
  M: 'month',
  m: 'minute',
  H: 'hour24',
  h: 'hour12',
} as const;
