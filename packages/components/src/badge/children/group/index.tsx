import { forwardRef } from 'react';
import clsx from 'clsx';
import type { BadgeGroupProps, BadgeRef } from '../../types';

/**
 * Badge.Group — the seamless multi-segment capsule: an inline-flex
 * row of `Badge.Item`s whose outer corners the seam rounds (the
 * default is a square's light rounding, `radius-sm`; `rounded` opts
 * into the full capsule radius). Segments stay radius-0 — the seam
 * rounds only the first/last visible corners. Shields.io-style
 * multi-segment badges.
 */
export const BadgeGroup = forwardRef<BadgeRef, BadgeGroupProps>((props, ref) => {
  const { rounded = false, className, children, ...rest } = props;
  return (
    <span
      ref={ref}
      className={clsx('colox-badge-group', rounded && 'colox-badge-group--rounded', className)}
      {...rest}
    >
      {children}
    </span>
  );
});

BadgeGroup.displayName = 'Badge.Group';
