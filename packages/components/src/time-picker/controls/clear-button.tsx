import { IconX } from '@colox/icons';
import { IconButton } from '../../icon-button';
import type { TimePickerClearButtonProps } from '../types';

/**
 * The built-in `clearable` control: the shared IconButton base carries
 * the hit shape and the muted colors; `mousedown` is prevented so
 * clearing never steals focus from the field.
 */
export const TimePickerClearButton = ({ onClear }: TimePickerClearButtonProps) => (
  <IconButton
    size="4"
    variant="muted"
    className="colox-time-picker__clear"
    aria-label="Clear time"
    onMouseDown={(event) => event.preventDefault()}
    onClick={onClear}
  >
    <IconX aria-hidden="true" />
  </IconButton>
);

TimePickerClearButton.displayName = 'TimePickerClearButton';
