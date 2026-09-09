import { forwardRef } from 'react';
import type { CSSProperties } from 'react';
import clsx from 'clsx';
import type { GridItemProps } from '../../types';

/**
 * A child of `Grid`. `span` places the item across columns through an
 * inline custom property (`--colox-grid-item-span: span N`), so
 * arbitrary column counts need no modifier class table.
 */
export const GridItem = forwardRef<HTMLDivElement, GridItemProps>((props, ref) => {
  const { span, className, style, children, ...rest } = props;
  const resolvedStyle =
    span === undefined
      ? style
      : ({ '--colox-grid-item-span': `span ${span}`, ...style } as CSSProperties);
  return (
    <div ref={ref} className={clsx('colox-grid-item', className)} style={resolvedStyle} {...rest}>
      {children}
    </div>
  );
});
