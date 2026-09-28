import { forwardRef } from 'react';
import clsx from 'clsx';
import type { BadgeItemProps, BadgeRef } from '../../types';
import { badgeItemVariants } from '../../variants';

/**
 * Badge.Item — one segment of a `Badge.Group`: a radius-0 capsule
 * piece (the group's overflow clip rounds the visible corners) with
 * its own palette/size/variant — every segment paints freely, so
 * multi-color shields.io-style badges compose naturally.
 */
export const BadgeItem = forwardRef<BadgeRef, BadgeItemProps>((props, ref) => {
  const { variant, palette, size, className, children, ...rest } = props;
  return (
    <span
      ref={ref}
      className={clsx(badgeItemVariants({ variant, palette, size }), className)}
      {...rest}
    >
      {children}
    </span>
  );
});

BadgeItem.displayName = 'Badge.Item';
