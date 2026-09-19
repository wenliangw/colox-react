import type { DatePanelLevel, DatePickerPanelProps } from '../types';
import { DatePickerGrid } from './grid';
import { DatePickerNavGroup } from './nav-group';
import { DatePickerTitleSlot } from './title-slot';

const resolveDialogLabel = (level: DatePanelLevel) => {
  if (level === 'month') {
    return 'Choose month';
  }
  if (level === 'year') {
    return 'Choose year';
  }
  return 'Choose date';
};

/**
 * The calendar panel: the header (double/single chevron groups
 * around the drilling title slot) over the level's grid. Pure
 * assembly — the grid unit paints the cells, the title slot renders
 * the split day segments (month climbs one level, year jumps to the
 * decade grid; the decade title is a terminal span) and the nav
 * groups step the level or its parent granularity.
 */
export const DatePickerPanel = ({
  level,
  view,
  locale,
  selected,
  today,
  activeIso,
  onShiftView,
  onShiftDoubleView,
  onSelectCell,
  onTitleClick,
  onGridKeyDown,
  isDisabled,
}: DatePickerPanelProps) => (
  <div className="colox-date-picker__panel" role="dialog" aria-label={resolveDialogLabel(level)}>
    <div className="colox-date-picker__panel-header">
      <DatePickerNavGroup
        side="start"
        level={level}
        onShiftView={onShiftView}
        onShiftDoubleView={onShiftDoubleView}
      />
      <DatePickerTitleSlot level={level} view={view} locale={locale} onTitleClick={onTitleClick} />
      <DatePickerNavGroup
        side="end"
        level={level}
        onShiftView={onShiftView}
        onShiftDoubleView={onShiftDoubleView}
      />
    </div>
    <DatePickerGrid
      level={level}
      view={view}
      locale={locale}
      selected={selected}
      today={today}
      activeIso={activeIso}
      onSelectCell={onSelectCell}
      onGridKeyDown={onGridKeyDown}
      isDisabled={isDisabled}
    />
  </div>
);
