/**
 * `@colox/react/cdk/date` — the public date/time toolbelt.
 *
 * The curated consumer-facing surface of the cdk date core: the value
 * contract stays the canonical ISO string ('YYYY-MM-DD', 'YYYY-MM',
 * 'YYYY', 'HH:mm'), and these helpers move values around it — format
 * for display, parse typed text, compare (lexicographic string order
 * is chronological order), shift days/months, and cross to native
 * `Date` when a consumer genuinely needs one. The panel grid builders
 * stay internal; this file is the whole public contract.
 */
export {
  addDaysIso as addDays,
  addMonthsIso as addMonths,
  compareIso as compare,
  todayIso,
} from './civil';
export { formatIso as formatDate, parseDateText } from './format';
export { formatTime, parseTimeText } from './time';
export { fromLocalDate, toLocalDate } from './local';
