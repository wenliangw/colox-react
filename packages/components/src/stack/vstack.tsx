import { forwardRef } from 'react';
import clsx from 'clsx';
import type { VStackProps } from './types';
import { vstackVariants } from './variants';

import './styles/index.scss';

/**
 * A gap-driven vertical stack. The spacing scale is theme-owned
 * (`--colox-spacing-*`), so children spacing stays in the token grid.
 */
export const VStack = forwardRef<HTMLDivElement, VStackProps>((props, ref) => {
  const { gap, align, justify, className, ...rest } = props;

  return (
    <div ref={ref} className={clsx(vstackVariants({ gap, align, justify }), className)} {...rest} />
  );
});
