/** Month lengths for common years — February flips under leap handling. */
export const DAYS_IN_MONTH = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

/** The month grid is 6×7 (42 cells) — a fixed shape keeps the panel height stable. */
export const GRID_CELL_COUNT = 42;

/** English weekday name tables for the display tokens — `EEE` picks the short table, `EEEE` the full one. */
export const WEEKDAY_SHORT = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
export const WEEKDAY_FULL = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
];
