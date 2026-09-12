import { IconX } from '@colox/icons';
import type { SelectClearButtonProps } from '../../types';

/**
 * The clear control, built here rather than reusing Input's
 * ClearButton: that one hardcodes aria-label "Clear input" and lives
 * in the input styles namespace. mousedown is prevented so the focus
 * never leaves the control while clearing.
 */
export const SelectClearButton = ({ onClick }: SelectClearButtonProps) => (
  <button
    type="button"
    className="colox-select__clear"
    aria-label="Clear selection"
    onMouseDown={(event) => event.preventDefault()}
    onClick={onClick}
  >
    <IconX aria-hidden="true" />
  </button>
);

SelectClearButton.displayName = 'SelectClearButton';
