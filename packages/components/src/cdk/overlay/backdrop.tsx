import { forwardRef } from 'react';
import clsx from 'clsx';
import type { BackdropProps } from './types';

import './styles/backdrop.scss';

/**
 * The overlay mask: the full-bleed dim layer behind a modal surface.
 * Decorative by design — `aria-hidden` keeps it out of the
 * accessibility tree (a plain div is not focusable anyway), and the
 * consumer wires the mask-close via `onClick` on this element.
 */
export const Backdrop = forwardRef<HTMLDivElement, BackdropProps>((props, ref) => {
  const { className, ...rest } = props;

  return (
    <div
      ref={ref}
      aria-hidden="true"
      className={clsx('colox-overlay__backdrop', className)}
      {...rest}
    />
  );
});

Backdrop.displayName = 'Backdrop';
