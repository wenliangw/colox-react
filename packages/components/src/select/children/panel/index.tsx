import { forwardRef } from 'react';
import type { MouseEvent, RefObject } from 'react';
import clsx from 'clsx';
import { IconCheck } from '@colox/icons';
import { Popup } from '@colox/cdk/floating';
import type { SelectOptionRecord } from '../../types';

export interface SelectPanelProps {
  open: boolean;
  listboxId: string;
  optionIdPrefix: string;
  /** The positioning reference (the trigger shell). */
  referenceRef: RefObject<HTMLElement | null>;
  /** The filtered members rendered as rows. */
  options: readonly SelectOptionRecord[];
  /** Index of the keyboard-highlighted row, -1 when none. */
  activeIndex: number;
  /** Whether a value reads as selected in the current mode. */
  isSelected: (value: string) => boolean;
  onOptionClick: (option: SelectOptionRecord, event: MouseEvent<HTMLDivElement>) => void;
}

interface SelectOptionRowProps {
  option: SelectOptionRecord;
  id: string;
  selected: boolean;
  active: boolean;
  onOptionClick: SelectPanelProps['onOptionClick'];
}

/** One listbox row: the compiled member's content, selected/active/disabled states. */
const SelectOptionRow = ({ option, id, selected, active, onOptionClick }: SelectOptionRowProps) => (
  <div
    id={id}
    role="option"
    aria-selected={selected}
    aria-disabled={option.disabled || undefined}
    aria-label={option.text}
    className={clsx(
      'colox-select__option',
      `colox-select__option--${option.size}`,
      {
        'colox-select__option--selected': selected,
        'colox-select__option--active': active,
        'colox-select__option--disabled': option.disabled,
      },
      option.className,
    )}
    style={option.style}
    onMouseDown={(event) => event.preventDefault()}
    onClick={(event) => onOptionClick(option, event)}
  >
    <span className="colox-select__option-label">{option.content}</span>
    {selected && <IconCheck className="colox-select__option-check" aria-hidden="true" />}
  </div>
);

/**
 * The option listbox inside the portal popup: rows carry their own
 * member-resolved size tier, `aria-label` pins the reachable name to
 * the member's `text` even when children provide a rich render, and
 * mousedown is prevented so the focus never leaves the control.
 */
export const SelectPanel = forwardRef<HTMLDivElement, SelectPanelProps>((props, ref) => {
  const {
    open,
    listboxId,
    optionIdPrefix,
    referenceRef,
    options,
    activeIndex,
    isSelected,
    onOptionClick,
  } = props;

  if (options.length === 0) {
    return (
      <Popup
        ref={ref}
        id={listboxId}
        role="listbox"
        referenceRef={referenceRef}
        open={open}
        className="colox-select__listbox"
      >
        <span className="colox-select__empty">No options</span>
      </Popup>
    );
  }

  return (
    <Popup
      ref={ref}
      id={listboxId}
      role="listbox"
      referenceRef={referenceRef}
      open={open}
      className="colox-select__listbox"
    >
      {options.map((option, index) => (
        <SelectOptionRow
          key={option.key}
          option={option}
          id={`${optionIdPrefix}-${index}`}
          selected={isSelected(option.value)}
          active={activeIndex === index}
          onOptionClick={onOptionClick}
        />
      ))}
    </Popup>
  );
});

SelectPanel.displayName = 'SelectPanel';
