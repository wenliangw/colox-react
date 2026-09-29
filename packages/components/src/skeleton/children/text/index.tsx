import { forwardRef } from 'react';
import clsx from 'clsx';
import type { SkeletonPartRef, SkeletonTextProps } from '../../types';
import { skeletonTextVariants } from '../../variants';

/**
 * Skeleton.Text — one line of placeholder text: a full-width capsule
 * whose height follows the font ladder (`size` sm/md/lg). Stack a few
 * in a `Stack` for a paragraph silhouette.
 */
export const SkeletonText = forwardRef<SkeletonPartRef, SkeletonTextProps>((props, ref) => {
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
      className={clsx(skeletonTextVariants({ size, animation }), className)}
      style={{ ...style, width }}
      aria-hidden={ariaHidden}
      {...rest}
    />
  );
});

SkeletonText.displayName = 'Skeleton.Text';
