import { forwardRef } from 'react';
import clsx from 'clsx';
import type { InputControlProps } from './types';

import './styles/input-control.scss';

/**
 * The bare native input control shared by any shell that needs an
 * embedded input: the base class carries the naked control reset
 * (borderless, font/color inheritance, no appearance) and is styled
 * standalone, so the control works inside any shell that provides the
 * visual contract. Input and Select both consume it; DatePicker-class
 * components will too. Internal only — not in the public barrel.
 */
export const InputControl = forwardRef<HTMLInputElement, InputControlProps>(
  ({ className, ...rest }, ref) => (
    <input ref={ref} className={clsx('colox-input-control', className)} {...rest} />
  ),
);

InputControl.displayName = 'InputControl';
