import type { TimePickerPanelProps } from '../types';
import { HOUR_COUNT, MINUTE_COUNT } from '../utils/format';
import { TimePickerColumn } from './time-column';

/**
 * The time panel: the two cyclic columns, side by side — hours to the
 * start, minutes to the end — riding the popup carrier. Pure
 * assembly: each column owns its step buttons and its 8-option
 * listbox, the hook owns the windows and the cursors.
 */
export const TimePickerPanel = ({
  hourAnchor,
  minuteAnchor,
  hourCursor,
  minuteCursor,
  hourSelected,
  minuteSelected,
  isDisabledHour,
  isDisabledMinute,
  onSelectOption,
  onColumnKeyDown,
  onScrollColumn,
}: TimePickerPanelProps) => (
  <div className="colox-time-picker__panel" role="dialog" aria-label="Choose time">
    <TimePickerColumn
      unit="hour"
      label="Hours"
      anchor={hourAnchor}
      cursor={hourCursor}
      count={HOUR_COUNT}
      selected={hourSelected}
      isDisabled={isDisabledHour}
      onSelect={(value) => onSelectOption('hour', value)}
      onKeyDown={(event, value) => onColumnKeyDown(event, 'hour', value)}
      onScroll={(delta) => onScrollColumn('hour', delta)}
    />
    <TimePickerColumn
      unit="minute"
      label="Minutes"
      anchor={minuteAnchor}
      cursor={minuteCursor}
      count={MINUTE_COUNT}
      selected={minuteSelected}
      isDisabled={isDisabledMinute}
      onSelect={(value) => onSelectOption('minute', value)}
      onKeyDown={(event, value) => onColumnKeyDown(event, 'minute', value)}
      onScroll={(delta) => onScrollColumn('minute', delta)}
    />
  </div>
);
