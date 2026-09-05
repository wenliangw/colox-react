import { forwardRef } from 'react';
import clsx from 'clsx';
import type { HStackProps } from './types';
import { hstackVariants } from './variants';

import './styles/index.scss';

/**
 * A gap-driven horizontal stack. The spacing scale is theme-owned
 * (`--colox-spacing-*`), so children spacing stays in the token grid.
 */
export const HStack = forwardRef<HTMLDivElement, HStackProps>((props, ref) => {
  const { gap, align, justify, wrap, className, ...rest } = props;

  return (
    <div
      ref={ref}
      className={clsx(hstackVariants({ gap, align, justify, wrap }), className)}
      {...rest}
    />
  );
});
