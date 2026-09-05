import { forwardRef } from 'react';
import clsx from 'clsx';
import type { HStackProps } from './types';

import './styles/index.scss';

/**
 * A gap-driven horizontal stack. The spacing scale is theme-owned
 * (`--colox-spacing-*`), so children spacing stays in the token grid.
 */
export const HStack = forwardRef<HTMLDivElement, HStackProps>((props, ref) => {
  const {
    gap = '2',
    align = 'stretch',
    justify = 'start',
    wrap = false,
    className,
    ...rest
  } = props;

  return (
    <div
      ref={ref}
      className={clsx(
        'colox-hstack',
        `colox-stack--gap-${gap}`,
        `colox-stack--align-${align}`,
        `colox-stack--justify-${justify}`,
        wrap && 'colox-hstack--wrap',
        className,
      )}
      {...rest}
    />
  );
});
