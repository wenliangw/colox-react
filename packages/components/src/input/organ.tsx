import { forwardRef } from 'react';
import type { InputHTMLAttributes } from 'react';
import clsx from 'clsx';

export type InputOrganProps = InputHTMLAttributes<HTMLInputElement>;

/**
 * The bare native input organ shared between the Input shell and other
 * components (Select's search organ): the base class carries the naked
 * control reset (borderless, font/color inheritance) and is styled
 * standalone, so the organ works inside any shell that provides the
 * visual contract. Internal only — not in the public barrel.
 */
export const InputOrgan = forwardRef<HTMLInputElement, InputOrganProps>(
  ({ className, ...rest }, ref) => (
    <input ref={ref} className={clsx('colox-input__control', className)} {...rest} />
  ),
);
