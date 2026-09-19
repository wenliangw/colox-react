import type { DatePickerLocale, ResolvedDatePickerLocale } from '../types';

/**
 * Panel chrome locale: the built-in calendar chrome (month header,
 * weekday row) reads these labels. Defaults are Chinese — the panel
 * is the calendar face of the field and follows the product's
 * language — with everything overridable through the `locale` prop.
 * The `valueFormat` weekday tokens (EEE/EEEE) are `valueFormat`'s
 * business: canonical English date-pattern vocabulary, unrelated to
 * this chrome layer.
 */
export const MONTH_LABELS_ZH = [
  '1月',
  '2月',
  '3月',
  '4月',
  '5月',
  '6月',
  '7月',
  '8月',
  '9月',
  '10月',
  '11月',
  '12月',
];

export const WEEKDAY_LABELS_ZH = ['一', '二', '三', '四', '五', '六', '日'];

export const YEAR_MONTH_PATTERN_ZH = '{year}年{month}';

/** Month-view title: the displayed year only. */
export const YEAR_PATTERN_ZH = '{year}年';

/** Year-view title: the decade window edges. */
export const DECADE_PATTERN_ZH = '{start}–{end}年';

/** Fills the `locale` prop gaps with the Chinese panel defaults. */
export const resolveDateLocale = (
  locale: DatePickerLocale | undefined,
): ResolvedDatePickerLocale => ({
  months: locale?.months ?? MONTH_LABELS_ZH,
  weekdays: locale?.weekdays ?? WEEKDAY_LABELS_ZH,
  yearMonthFormat: locale?.yearMonthFormat ?? YEAR_MONTH_PATTERN_ZH,
  yearFormat: locale?.yearFormat ?? YEAR_PATTERN_ZH,
  decadeFormat: locale?.decadeFormat ?? DECADE_PATTERN_ZH,
});

/** Composes the panel header title from the viewport and the locale. */
export const composeYearMonth = (
  year: number,
  month: number,
  locale: ResolvedDatePickerLocale,
): string =>
  locale.yearMonthFormat
    .replace('{year}', String(year))
    .replace('{month}', locale.months[month - 1]);

/** Composes the month-view title (year only). */
export const composeYear = (year: number, locale: ResolvedDatePickerLocale): string =>
  locale.yearFormat.replace('{year}', String(year));

/** Composes the year-view title (decade window). */
export const composeDecade = (decadeStart: number, locale: ResolvedDatePickerLocale): string =>
  locale.decadeFormat
    .replace('{start}', String(decadeStart))
    .replace('{end}', String(decadeStart + 11));
