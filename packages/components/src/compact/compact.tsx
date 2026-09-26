import { forwardRef } from 'react';
import clsx from 'clsx';
import type { CompactProps } from './types';

import './styles/index.scss';

/**
 * The visual joining base: one seam, shared borders, focus rings that
 * breathe across members, radii only at the two ends. The members keep
 * their own values, states and payloads — Compact never speaks for them.
 */
export const Compact = forwardRef<HTMLDivElement, CompactProps>((props, ref) => {
  const { children, className, ...rest } = props;

  return (
    <div ref={ref} className={clsx('colox-compact', className)} {...rest}>
      {children}
    </div>
  );
});

Compact.displayName = 'Compact';
