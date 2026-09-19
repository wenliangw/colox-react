import { forwardRef } from 'react';
import clsx from 'clsx';
import type { AnchorProps } from './types';
import { anchorVariants } from './variants';

import './styles/index.scss';

/**
 * The reference frame: a layout-neutral relative box whose own box is
 * what absolutely positioned boxes resolve against — useful on its own
 * (any absolute child, including a floating layer, can use it as its
 * reference) and as the frame a `Positioner` pins into. It owns only the
 * positioning relationship — flexbox/grid flow belongs to Stack/Grid —
 * and `inline` makes it hug its content for the badge shape.
 */
export const Anchor = forwardRef<HTMLDivElement, AnchorProps>((props, ref) => {
  const { inline = false, className, children, ...rest } = props;

  return (
    <div ref={ref} className={clsx(anchorVariants({ inline }), className)} {...rest}>
      {children}
    </div>
  );
});

Anchor.displayName = 'Anchor';
