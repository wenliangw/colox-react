import type { MouseEvent } from 'react';
import { IconChevronDown, IconChevronUp } from '@colox/icons';
import type { StepperProps } from '../types';

/**
 * The built-in stepper pair in the trailing strip: two half-height
 * chevron buttons stacked vertically (up = increase, down =
 * decrease). They are pointer affordances that duplicate the
 * Arrow-key stepping, so they stay out of the tab order — the input's
 * spinbutton semantics and keyboard stepping are the accessible
 * path. `mousedown` is prevented so clicking never steals focus from
 * the input (a blur would clamp mid-draft states).
 */
export const Stepper = ({ onStep, disabled }: StepperProps) => {
  const keepFocus = (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
  };

  return (
    <span className="colox-input-number__steppers">
      <button
        type="button"
        tabIndex={-1}
        className="colox-input-number__stepper colox-input-number__stepper--up"
        aria-label="Increase value"
        disabled={disabled}
        onMouseDown={keepFocus}
        onClick={() => onStep(1)}
      >
        <IconChevronUp />
      </button>
      <button
        type="button"
        tabIndex={-1}
        className="colox-input-number__stepper colox-input-number__stepper--down"
        aria-label="Decrease value"
        disabled={disabled}
        onMouseDown={keepFocus}
        onClick={() => onStep(-1)}
      >
        <IconChevronDown />
      </button>
    </span>
  );
};
