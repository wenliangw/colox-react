import { forwardRef } from 'react';
import clsx from 'clsx';
import type { ContainerProps } from './types';
import { containerVariants } from './variants';

import './styles/index.scss';

/**
 * The semantic width shell: caps content to a breakpoint-width ceiling,
 * centers it and pads it inline. Size keys are the breakpoint words and
 * each cap references the same-named `--colox-breakpoint-*` variable, so
 * the widths stay single-sourced in the design language. The component
 * is fully static — no theme context, no runtime resolution.
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
