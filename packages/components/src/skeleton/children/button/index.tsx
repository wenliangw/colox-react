import { forwardRef } from 'react';
import clsx from 'clsx';
import type { SkeletonButtonProps, SkeletonPartRef } from '../../types';
import { skeletonButtonVariants } from '../../variants';

/**
 * Skeleton.Button — a button-shaped placeholder whose height mirrors
 * the Button control ladder (xs/sm/md/lg). It reserves the button slot
 * in forms and toolbars while the action loads.
 */
export const SkeletonButton = forwardRef<SkeletonPartRef, SkeletonButtonProps>((props, ref) => {
  const {
    animation,
    'aria-hidden': ariaHidden = true,
    size,
    width,
    style,
    className,
    ...rest
  } = props;
  return (
    <span
      ref={ref}
      className={clsx(skeletonButtonVariants({ size, animation }), className)}
      style={{ ...style, width }}
      aria-hidden={ariaHidden}
      {...rest}
    />
  );
});

SkeletonButton.displayName = 'Skeleton.Button';
