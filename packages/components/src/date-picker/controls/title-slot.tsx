import type { DatePanelLevel, DatePickerTitleSlotProps } from '../types';
import { composeDecade, composeYear } from '../utils/locale';
import { viewDecadeOf, viewYearOf } from '../utils/view';

const titleButton = (
  label: string,
  target: DatePanelLevel,
  onTitleClick: DatePickerTitleSlotProps['onTitleClick'],
) => (
  <button
    type="button"
    tabIndex={-1}
    className="colox-date-picker__panel-title colox-date-picker__title-button"
    onClick={() => onTitleClick(target)}
  >
    {label}
  </button>
);

/**
 * The header title slot — the drilling path. The day grid's title
 * splits into its two segments, each drilling on its own: the month
 * button climbs one level to the month grid while the year button
 * jumps straight to the decade grid (the month grid's year button
 * climbs one level). The decade title is terminal — a plain span
 * with the same box but no click program. Title buttons ride the
 * palette solid on hover ("this leads somewhere"), the navigation
 * chevrons stay muted.
 */
export const DatePickerTitleSlot = ({
  level,
  view,
  locale,
  onTitleClick,
}: DatePickerTitleSlotProps) => {
  if (level === 'year') {
    return (
      <span className="colox-date-picker__panel-title">
        {composeDecade(viewDecadeOf(view), locale)}
      </span>
    );
  }
  if (level === 'month') {
    return titleButton(composeYear(viewYearOf(view), locale), 'year', onTitleClick);
  }
  if (view.picker !== 'date') {
    return null;
  }
  return (
    <span className="colox-date-picker__panel-title-group">
      {titleButton(composeYear(view.year, locale), 'year', onTitleClick)}
      {titleButton(locale.months[view.month - 1], 'month', onTitleClick)}
    </span>
  );
};
