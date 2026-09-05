import { forwardRef } from 'react';
import clsx from 'clsx';
import type { StackItemProps } from './types';
import { stackItemVariants } from './variants';

/**
 * A child of `Stack`. `grow` absorbs the free space along the main axis
 * (the Spacer semantics); dimming/src modifiers stay one escape hatch
 * (className) away.
 */
export const StackItem = forwardRef<HTMLDivElement, StackItemProps>((props, ref) => {
  const { grow, className, ...rest } = props;

  return <div ref={ref} className={clsx(stackItemVariants({ grow }), className)} {...rest} />;
});
