import type { KeyboardEvent } from 'react';
import clsx from 'clsx';
import type { DatePanelLevel, DatePickerGridCell, DatePickerGridProps } from '../types';
import { granularIsoOf } from '../utils/date-core';
import { gridCellsOf } from '../utils/view';

interface DatePickerGridCellProps {
  /** The cell to paint (canonical iso + display label + dim flag). */
  cell: DatePickerGridCell;
  /** The grid level — the current-cell granularity follows it. */
  level: DatePanelLevel;
  /** The committed selection (canonical at the granularity), if any. */
  selected: string | null;
  /** Today's ISO date (current-cell highlight derives from it). */
  today: string;
  /** The keyboard focus anchor (selection, current, or the grid's home). */
  activeIso: string | null;
  /** Picks a cell: commits at the base level, descends a level above it. */
  onSelectCell: (iso: string) => void;
  /** Grid key navigation for a cell. */
  onGridKeyDown: (event: KeyboardEvent<HTMLButtonElement>, iso: string) => void;
  /** Whether a cell value is outside `[min, max]`. */
  isDisabled: (iso: string) => boolean;
}

interface DatePickerGridRowsProps extends Omit<DatePickerGridCellProps, 'cell'> {
  /** The cells to lay out, row after row. */
  cells: DatePickerGridCell[];
  /** Columns per row (7 for the day grid, 3 for the compact grids). */
  columns: number;
}

const chunkRows = (cells: DatePickerGridCell[], columns: number) => {
  const rows: DatePickerGridCell[][] = [];
  for (let index = 0; index < cells.length; index += columns) {
    rows.push(cells.slice(index, index + columns));
  }
  return rows;
};

const DatePickerGridCell = ({
  cell,
  level,
  selected,
  today,
  activeIso,
  onSelectCell,
  onGridKeyDown,
  isDisabled,
}: DatePickerGridCellProps) => {
  const isSelected = cell.iso === selected;
  const isCurrent = cell.iso === granularIsoOf(today, level);
  const disabled = isDisabled(cell.iso);
  return (
    <button
      type="button"
      role="gridcell"
      data-iso={cell.iso}
      tabIndex={cell.iso === activeIso ? 0 : -1}
      className={clsx('colox-date-picker__day', {
        'colox-date-picker__day--selected': isSelected,
        'colox-date-picker__day--today': isCurrent,
        'colox-date-picker__day--muted': cell.inView === false,
        'colox-date-picker__day--disabled': disabled,
      })}
      aria-label={cell.iso}
      aria-selected={isSelected}
      aria-disabled={disabled || undefined}
      disabled={disabled}
      onClick={() => onSelectCell(cell.iso)}
      onKeyDown={(event: KeyboardEvent<HTMLButtonElement>) => onGridKeyDown(event, cell.iso)}
    >
      {cell.label}
    </button>
  );
};

const DatePickerGridRows = ({ cells, columns, ...cellProps }: DatePickerGridRowsProps) => (
  <>
    {chunkRows(cells, columns).map((rowCells) => (
      <div key={rowCells[0].iso} role="row" className="colox-date-picker__row">
        {rowCells.map((cell) => (
          <DatePickerGridCell key={cell.iso} cell={cell} {...cellProps} />
        ))}
      </div>
    ))}
  </>
);

/**
 * The level's grid body: the 6×7 day grid under its weekday row, or
 * the compact 3×4 month/year grids. Cells are buttons (the pointer
 * path), the grid keyboard rotation the accessible path — adjacent
 * month fill renders dimmed but selectable, the current cell wears
 * the palette subtle treat until selected.
 */
export const DatePickerGrid = ({
  level,
  view,
  locale,
  selected,
  today,
  activeIso,
  onSelectCell,
  onGridKeyDown,
  isDisabled,
}: DatePickerGridProps) => {
  const cells = gridCellsOf(view, locale.months, level);
  if (cells === null) {
    return null;
  }
  const rowsProps = { level, selected, today, activeIso, onSelectCell, onGridKeyDown, isDisabled };
  if (level === 'date') {
    return (
      <div className="colox-date-picker__grid" role="grid" aria-label="Calendar days">
        <div className="colox-date-picker__weekdays" role="row">
          {locale.weekdays.map((name) => (
            <span key={name} role="columnheader" className="colox-date-picker__weekday">
              {name}
            </span>
          ))}
        </div>
        <DatePickerGridRows cells={cells} columns={7} {...rowsProps} />
      </div>
    );
  }
  return (
    <div className="colox-date-picker__grid colox-date-picker__grid--compact" role="grid">
      <DatePickerGridRows cells={cells} columns={3} {...rowsProps} />
    </div>
  );
};
