import { forwardRef } from 'react';
import clsx from 'clsx';
import type { BadgeCountProps, BadgeRef } from '../../types';
import { badgeCountVariants } from '../../variants';

/**
 * Badge.Count — the count capsule: an always-solid pill showing the
 * count, truncated at `overflowCount` (default 99 → "99+"). Hides at
 * zero unless `showZero`.
 */
export const BadgeCount = forwardRef<BadgeRef, BadgeCountProps>((props, ref) => {
  const { count, overflowCount = 99, showZero = false, palette, size, className, ...rest } = props;

  if (count === 0 && !showZero) {
    return null;
  }

  const label = count > overflowCount ? `${overflowCount}+` : String(count);

  return (
    <span ref={ref} className={clsx(badgeCountVariants({ palette, size }), className)} {...rest}>
      {label}
    </span>
  );
});

BadgeCount.displayName = 'Badge.Count';
