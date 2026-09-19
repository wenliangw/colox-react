import { forwardRef } from 'react';
import type { MouseEvent } from 'react';
import clsx from 'clsx';
import { Popup } from '@colox/cdk/floating';
import type { AutoCompleteOptionRecord, AutoCompletePanelProps } from '../types';

/**
 * The private row unit: its props stay with the row, not in types/.
 */
interface AutoCompleteOptionRowProps {
  option: AutoCompleteOptionRecord;
  id: string;
  active: boolean;
  onOptionClick: (option: AutoCompleteOptionRecord, event: MouseEvent<HTMLElement>) => void;
}

const AutoCompleteOptionRow = ({
  option,
  id,
  active,
  onOptionClick,
}: AutoCompleteOptionRowProps) => (
  <div
    id={id}
    role="option"
    aria-selected={active}
    aria-disabled={option.disabled || undefined}
    className={clsx('colox-autocomplete__option', option.className, {
      'colox-autocomplete__option--active': active,
      'colox-autocomplete__option--disabled': option.disabled,
    })}
    style={option.style}
    onMouseDown={(event) => {
      event.preventDefault();
    }}
    onClick={(event) => {
      if (!option.disabled) {
        onOptionClick(option, event);
      }
    }}
  >
    {option.content}
  </div>
);

/**
 * The suggestion listbox inside the cdk popup: rows are fixed at the
 * family md tier (no size inheritance — the host owns its content
 * size and the list is a suggestion surface, not a form collection),
 * the roaming highlight is the only wash, and row mousedown is
 * barred so focus never leaves the host control.
 */
export const AutoCompletePanel = forwardRef<HTMLDivElement, AutoCompletePanelProps>(
  ({ open, listboxId, referenceRef, options, activeIndex, onOptionClick }, ref) => {
    if (options.length === 0) {
      return (
        <Popup
          ref={ref}
          id={listboxId}
          role="listbox"
          referenceRef={referenceRef}
          open={open}
          className="colox-autocomplete__listbox"
        >
          <span className="colox-autocomplete__empty">No options</span>
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
        className="colox-autocomplete__listbox"
      >
        {options.map((option, index) => (
          <AutoCompleteOptionRow
            key={option.key}
            option={option}
            id={`${listboxId}-item-${index}`}
            active={activeIndex === index}
            onOptionClick={onOptionClick}
          />
        ))}
      </Popup>
    );
  },
);

AutoCompletePanel.displayName = 'AutoCompletePanel';
