import { IconChevronLeft, IconChevronRight } from '@colox/icons';
import type { DatePanelLevel, DatePickerNavGroupProps } from '../types';

/**
 * The single/double arrow steps per level: the single chevron takes
 * the level's own granularity (month on the day grid, year on the
 * month grid) and the double chevron the parent granularity (year /
 * decade). The year panel keeps the double arrows only.
 */
const stepsOf = (level: DatePanelLevel): { single: string; double: string } => {
  if (level === 'date') {
    return { single: 'month', double: 'year' };
  }
  return { single: 'year', double: 'decade' };
};

/**
 * One header chevron group: the double arrow outboard of the single
 * (the year panel hides the single). The double arrow draws two
 * chevrons overlapped into one glyph — a layout detail, not a new
 * icon asset.
 */
export const DatePickerNavGroup = ({
  side,
  level,
  onShiftView,
  onShiftDoubleView,
}: DatePickerNavGroupProps) => {
  const steps = stepsOf(level);
  const direction = side === 'start' ? 'Previous' : 'Next';
  const delta = side === 'start' ? -1 : 1;
  const Icon = side === 'start' ? IconChevronLeft : IconChevronRight;
  const doubleButton = (
    <button
      key="double"
      type="button"
      tabIndex={-1}
      className="colox-date-picker__nav colox-date-picker__nav--double"
      aria-label={`${direction} ${steps.double}`}
      onClick={() => onShiftDoubleView(delta)}
    >
      <Icon />
      <Icon />
    </button>
  );
  const singleButton =
    level === 'year' ? null : (
      <button
        key="single"
        type="button"
        tabIndex={-1}
        className="colox-date-picker__nav"
        aria-label={`${direction} ${steps.single}`}
        onClick={() => onShiftView(delta)}
      >
        <Icon />
      </button>
    );
  return (
    <div className="colox-date-picker__nav-group">
      {side === 'start' ? [doubleButton, singleButton] : [singleButton, doubleButton]}
    </div>
  );
};
