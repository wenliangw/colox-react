import type { MouseEvent, ReactNode } from 'react';
import { IconX } from '@colox/icons';

interface ClearButtonProps {
  onClear: () => void;
  /** Replaces the default `IconX`. @default <IconX /> */
  icon?: ReactNode;
}

/**
 * The built-in `clearable` control. `mousedown` is prevented so clicking it
 * never steals focus from the input; clearing itself flows through the
 * input's onChange stream (see `useInputFilter#handleClear`).
 */
export const ClearButton = ({ onClear, icon = <IconX /> }: ClearButtonProps) => {
  const keepFocus = (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
  };

  return (
    <button
      type="button"
      className="colox-input__clear"
      aria-label="Clear input"
      onMouseDown={keepFocus}
      onClick={onClear}
    >
      {icon}
    </button>
  );
};
