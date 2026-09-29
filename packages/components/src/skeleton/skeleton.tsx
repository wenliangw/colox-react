import { forwardRef } from 'react';
import clsx from 'clsx';
import { SkeletonButton } from './children/button';
import { SkeletonCircle } from './children/circle';
import { SkeletonText } from './children/text';
import type { SkeletonProps, SkeletonRef } from './types';
import { skeletonVariants } from './variants';

import './styles/index.scss';

/**
 * Skeleton — the loading-placeholder family: neutral fabric shapes
 * that reserve a slot's real estate until the content arrives (no
 * layout jump when it does). The root is the rect block; the
 * `Skeleton.Text` line, `Skeleton.Circle` round and `Skeleton.Button`
 * control shapes join it. `animation` (pulse/wave/none) is the shared
 * motion axis; every shape is decorative and `aria-hidden` by default.
 * Pure display: no events, no state — the caller owns the
 * `loading ? <Skeleton /> : <Content />` switch.
 */
const SkeletonRoot = forwardRef<SkeletonRef, SkeletonProps>((props, ref) => {
  const {
    animation,
    'aria-hidden': ariaHidden = true,
    width,
    height,
    style,
    className,
    ...rest
  } = props;
  return (
    <div
      ref={ref}
      className={clsx(skeletonVariants({ animation }), className)}
      style={{ ...style, width, height }}
      aria-hidden={ariaHidden}
      {...rest}
    />
  );
});

SkeletonRoot.displayName = 'Skeleton';

export const Skeleton = Object.assign(SkeletonRoot, {
  Text: SkeletonText,
  Circle: SkeletonCircle,
  Button: SkeletonButton,
});

export type SkeletonComponent = typeof Skeleton;
