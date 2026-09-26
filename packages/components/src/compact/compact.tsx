import { forwardRef, useMemo } from 'react';
import clsx from 'clsx';
import { CompactContext } from './compact-context';
import type { CompactProps } from './types';

import './styles/index.scss';

/**
 * The visual joining base: one seam, shared borders, focus rings that
 * breathe across members, radii only at the two ends. The members keep
 * their own values, states and payloads — Compact never speaks for them
 * and never clones them: `size` / `palette` reach members as context
 * defaults only.
 */
export const Compact = forwardRef<HTMLDivElement, CompactProps>((props, ref) => {
  const { children, className, size, palette, ...rest } = props;
  const contextValue = useMemo(() => ({ size, palette }), [size, palette]);

  return (
    <CompactContext.Provider value={contextValue}>
      <div
        ref={ref}
        className={clsx('colox-compact', palette && `colox-compact--palette-${palette}`, className)}
        {...rest}
      >
        {children}
      </div>
    </CompactContext.Provider>
  );
});

Compact.displayName = 'Compact';
