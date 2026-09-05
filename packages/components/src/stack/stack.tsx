import { forwardRef, useCallback, useMemo, useState } from 'react';
import clsx from 'clsx';
import { StackContext } from './context';
import { StackItem } from './children/item';
import { StackResponsive } from './children/responsive';
import type { StackGap, StackProps } from './types';
import { stackVariants } from './variants';

import './styles/index.scss';

/**
 * The flexbox layout primitive: one mechanism, semantic props riding the
 * theme token grid. Responsive gap is opt-in: mounted Stack.Responsive
 * parts resolve per-breakpoint overrides, so a static Stack never
 * touches the theme context.
 */
const StackRoot = forwardRef<HTMLDivElement, StackProps>((props, ref) => {
  const { direction, gap, align, justify, wrap, children, className, ...rest } = props;

  const [responsiveGap, setResponsiveGap] = useState<StackGap | undefined>(undefined);

  const registerResponsiveGap = useCallback((registeredGap: StackGap | undefined) => {
    setResponsiveGap(registeredGap);
  }, []);

  const contextValue = useMemo(() => ({ registerResponsiveGap }), [registerResponsiveGap]);

  return (
    <StackContext.Provider value={contextValue}>
      <div
        ref={ref}
        className={clsx(
          stackVariants({ direction, gap: responsiveGap ?? gap, align, justify, wrap }),
          className,
        )}
        {...rest}
      >
        {children}
      </div>
    </StackContext.Provider>
  );
});

type StackComponent = typeof StackRoot & {
  Item: typeof StackItem;
  Responsive: typeof StackResponsive;
};

export const Stack: StackComponent = Object.assign(StackRoot, {
  Item: StackItem,
  Responsive: StackResponsive,
});
