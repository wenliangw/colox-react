import type { TimePickerPanelProps } from '../types';
import { HOUR_COUNT, MINUTE_COUNT, SECOND_COUNT } from '../utils/format';
import { TimePickerColumn } from './time-column';

/** The time panel: the three cyclic columns riding the popup carrier plus the confirm footer (assembly only). */
export const TimePickerPanel = ({
  hourValue,
  minuteValue,
  secondValue,
  hourSelected,
  minuteSelected,
  secondSelected,
  confirmText,
  confirmBlocked,
  isDisabledOption,
  onSelectOption,
  onScrollColumn,
  onColumnKeyDown,
  onConfirm,
}: TimePickerPanelProps) => (
  <div className="colox-time-picker__panel" role="dialog" aria-label="Choose time">
    <div className="colox-time-picker__columns">
      <TimePickerColumn
        unit="hour"
        label="Hours"
        count={HOUR_COUNT}
        value={hourValue}
        selected={hourSelected}
        isDisabled={(value) => isDisabledOption('hour', value)}
        onSelect={(value) => onSelectOption('hour', value)}
        onScroll={(delta) => onScrollColumn('hour', delta)}
        onKeyDown={(event) => onColumnKeyDown(event, 'hour')}
      />
      <TimePickerColumn
        unit="minute"
        label="Minutes"
        count={MINUTE_COUNT}
        value={minuteValue}
        selected={minuteSelected}
        isDisabled={(value) => isDisabledOption('minute', value)}
        onSelect={(value) => onSelectOption('minute', value)}
        onScroll={(delta) => onScrollColumn('minute', delta)}
        onKeyDown={(event) => onColumnKeyDown(event, 'minute')}
      />
      <TimePickerColumn
        unit="second"
        label="Seconds"
        count={SECOND_COUNT}
        value={secondValue}
        selected={secondSelected}
        isDisabled={(value) => isDisabledOption('second', value)}
        onSelect={(value) => onSelectOption('second', value)}
        onScroll={(delta) => onScrollColumn('second', delta)}
        onKeyDown={(event) => onColumnKeyDown(event, 'second')}
      />
    </div>
    <div className="colox-time-picker__footer">
      <button
        type="button"
        className="colox-time-picker__confirm"
        aria-label={confirmText}
        disabled={confirmBlocked}
        onClick={onConfirm}
      >
        {confirmText}
      </button>
    </div>
  </div>
);
