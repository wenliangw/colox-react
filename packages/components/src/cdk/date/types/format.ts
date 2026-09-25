/**
 * The typed-text parse precision: how far a string pins the civil
 * date — year only, year+month, or a full date. A draft commits only
 * when its precision reaches the field's granularity (typing more
 * precision than the field provides is accepted and truncated).
 */
export type ParsePrecision = 0 | 1 | 2;

/** One compiled piece of a `valueFormat` pattern. */
export type DateFormatPart =
  | {
      type: 'year' | 'month' | 'day' | 'weekday' | 'hour24' | 'hour12' | 'minute' | 'second';
      length: number;
    }
  | { type: 'literal'; text: string };
