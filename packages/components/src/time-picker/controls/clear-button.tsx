import { IconX } from '@colox/icons';
import { IconButton } from '../../icon-button';
import type { TimePickerClearButtonProps } from '../types';

/**
 * The built-in `clearable` control, mirroring the Select interaction:
 * the reset, hit shape, focus ring and muted variant colors ride the
 * shared IconButton base; this file keeps only the site program.
 * `mousedown` is prevented so clearing never steals focus from the
 * field; clearing flows through the picker's onChange stream (a
 * change-shaped synthetic committing `null`).
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
