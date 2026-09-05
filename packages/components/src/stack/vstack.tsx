import { forwardRef } from 'react';
import clsx from 'clsx';
import type { VStackProps } from './types';

import './styles/index.scss';

/**
 * A gap-driven vertical stack. The spacing scale is theme-owned
 * (`--colox-spacing-*`), so children spacing stays in the token grid.
 */
export const VStack = forwardRef<HTMLDivElement, VStackProps>((props, ref) => {
  const { gap = '4', align = 'stretch', justify = 'start', className, ...rest } = props;

  return (
    <div
      ref={ref}
      className={clsx(
        'colox-vstack',
        `colox-stack--gap-${gap}`,
        `colox-stack--align-${align}`,
        `colox-stack--justify-${justify}`,
        className,
      )}
      {...rest}
    />
  );
});
