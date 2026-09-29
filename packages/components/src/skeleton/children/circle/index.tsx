import { forwardRef } from 'react';
import clsx from 'clsx';
import type { SkeletonCircleProps, SkeletonPartRef } from '../../types';
import { skeletonCircleVariants } from '../../variants';

/**
 * Skeleton.Circle — a round placeholder for avatars, icons and any
 * round media. The size tiers mirror the Avatar footprints (xs 24 /
 * sm 32 / md 40 / lg 48) and any theme size-token key is addressable —
 * `size="7"` renders a 28px circle.
 */
export const SkeletonCircle = forwardRef<SkeletonPartRef, SkeletonCircleProps>((props, ref) => {
  const { animation, 'aria-hidden': ariaHidden = true, size, className, ...rest } = props;
  return (
    <span
      ref={ref}
      className={clsx(skeletonCircleVariants({ size, animation }), className)}
      aria-hidden={ariaHidden}
      {...rest}
    />
  );
});

SkeletonCircle.displayName = 'Skeleton.Circle';
