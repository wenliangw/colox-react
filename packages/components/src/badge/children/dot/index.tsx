import { forwardRef } from 'react';
import clsx from 'clsx';
import type { BadgeDotProps, BadgeRef } from '../../types';
import { badgeDotVariants } from '../../variants';

/**
 * Badge.Dot — the status point: a solid palette circle with no text
 * and no strength concept (a dot is a filled point). Pair with
 * `Anchor` + `Positioner` to pin it to a corner of a host.
 */
export const BadgeDot = forwardRef<BadgeRef, BadgeDotProps>((props, ref) => {
  const { palette, size, className, ...rest } = props;
  return (
    <span ref={ref} className={clsx(badgeDotVariants({ palette, size }), className)} {...rest} />
  );
});

BadgeDot.displayName = 'Badge.Dot';
