import { forwardRef } from 'react';
import clsx from 'clsx';
import { BadgeCount } from './children/count';
import { BadgeDot } from './children/dot';
import { BadgeGroup } from './children/group';
import { BadgeItem } from './children/item';
import type { BadgeProps, BadgeRef } from './types';
import { badgeVariants } from './variants';

import './styles/index.scss';

/**
 * Badge — the pure-display badge family: a standalone capsule (the
 * root, `children` carry the label/pill form), a status point
 * (`Badge.Dot`), a count capsule (`Badge.Count`) and the seamless
 * multi-segment badge (`Badge.Group` of `Badge.Item`s, shields.io
 * style). Anchoring is not built in — compose `Anchor` (inline) with
 * `Positioner` to pin a badge to a corner of a host element.
 *
 * Axes: palette (six design-language families, default gray), size
 * (sm/md/lg) and variant (solid/subtle/outline/plain, default solid)
 * where the surface has a strength. The Dot is always a solid point;
 * the Count is always a solid capsule.
 */
const BadgeRoot = forwardRef<BadgeRef, BadgeProps>((props, ref) => {
  const { variant, palette, size, className, children, ...rest } = props;
  return (
    <span
      ref={ref}
      className={clsx(badgeVariants({ variant, palette, size }), className)}
      {...rest}
    >
      {children}
    </span>
  );
});

BadgeRoot.displayName = 'Badge';

export const Badge = Object.assign(BadgeRoot, {
  Count: BadgeCount,
  Dot: BadgeDot,
  Group: BadgeGroup,
  Item: BadgeItem,
});

export type BadgeComponent = typeof Badge;
