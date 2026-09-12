import type { MouseEvent, ReactNode } from 'react';
import { IconEye, IconEyeOff } from '@colox/icons';
import { IconButton } from '../../icon-button';

interface VisibilityToggleProps {
  /** Whether the password is currently revealed as plain text. */
  revealed: boolean;
  onToggle: () => void;
  /** Shown while revealed. @default <IconEye /> */
  eyeIcon?: ReactNode;
  /** Shown while hidden. @default <IconEyeOff /> */
  eyeOffIcon?: ReactNode;
  disabled?: boolean;
}

/**
 * The built-in password visibility toggle rides the shared IconButton
 * base; this file keeps only the input-specific behavior.
 * State-indicating icons: the eye reflects the value's current
 * visibility (closed while hidden, open while revealed), not the
 * action a click would take. `mousedown` is prevented so toggling
 * never steals focus from the input.
 */
export const VisibilityToggle = ({
  revealed,
  onToggle,
  eyeIcon = <IconEye />,
  eyeOffIcon = <IconEyeOff />,
  disabled,
}: VisibilityToggleProps) => {
  const keepFocus = (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
  };

  return (
    <IconButton
      size="4"
      className="colox-input__toggle"
      aria-label={revealed ? 'Hide password' : 'Show password'}
      onMouseDown={keepFocus}
      onClick={onToggle}
      disabled={disabled}
    >
      {revealed ? eyeIcon : eyeOffIcon}
    </IconButton>
  );
};
