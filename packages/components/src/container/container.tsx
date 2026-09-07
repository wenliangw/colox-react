import { forwardRef } from 'react';
import clsx from 'clsx';
import type { ContainerProps } from './types';
import { containerVariants } from './variants';

import './styles/index.scss';

/**
 * The semantic width shell: caps content to a design-token width
 * ceiling, centers it and pads it inline. Each size cap references a
 * large-dimension `--colox-size-*` token, so the widths are proper
 * design-language constants — breakpoints serve responsive logic only,
 * never width. Fully static: no theme context, no runtime resolution.
 */
export const Container = forwardRef<HTMLDivElement, ContainerProps>((props, ref) => {
  const { size, gutter, align, children, className, ...rest } = props;

  return (
    <div
      ref={ref}
      className={clsx(containerVariants({ size, gutter, align }), className)}
      {...rest}
    >
      {children}
    </div>
  );
});
