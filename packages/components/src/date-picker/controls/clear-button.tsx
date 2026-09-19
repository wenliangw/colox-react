import { IconX } from '@colox/icons';
import { IconButton } from '../../icon-button';

export interface DatePickerClearButtonProps {
  onClear: () => void;
}

/**
 * The built-in `clearable` control, mirroring the Select interaction:
 * the reset, hit shape, focus ring and muted variant colors ride the
 * shared IconButton base; this file keeps only the site program.
 * `mousedown` is prevented so clearing never steals focus from the
 * field; clearing flows through the picker's onChange stream (a
 * change-shaped synthetic committing `null`).
 */
export const DatePickerClearButton = ({ onClear }: DatePickerClearButtonProps) => (
  <IconButton
    size="4"
    variant="muted"
    className="colox-date-picker__clear"
    aria-label="Clear date"
    onMouseDown={(event) => event.preventDefault()}
    onClick={onClear}
  >
    <IconX aria-hidden="true" />
  </IconButton>
);

DatePickerClearButton.displayName = 'DatePickerClearButton';
