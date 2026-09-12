import { IconX } from '@colox/icons';
import { IconButton } from '../../../icon-button';
import type { SelectClearButtonProps } from '../../types';

/**
 * The clear control, built here rather than reusing Input's
 * ClearButton: that one hardcodes aria-label "Clear input" and lives
 * in the input styles namespace. mousedown is prevented so the focus
 * never leaves the control while clearing. The site class only runs
 * the swap-into-the-chevron-slot reveal — the reset, hit shape, focus
 * ring and disabled semantics ride the shared IconButton base.
 */
export const SelectClearButton = ({ onClick }: SelectClearButtonProps) => (
  <IconButton
    size="4"
    className="colox-select__clear"
    aria-label="Clear selection"
    onMouseDown={(event) => event.preventDefault()}
    onClick={onClick}
  >
    <IconX aria-hidden="true" />
  </IconButton>
);

SelectClearButton.displayName = 'SelectClearButton';
