/**
 * The footer count display: bare length without `maxLength`, the shared
 * `n / max` form with it. Length is UTF-16 code units — the same measure
 * the native `maxlength` attribute enforces, so the display never
 * disagrees with the browser's truncation.
 */
export const formatTextareaCount = (length: number, maxLength: number | undefined): string =>
  maxLength === undefined ? `${length}` : `${length} / ${maxLength}`;
