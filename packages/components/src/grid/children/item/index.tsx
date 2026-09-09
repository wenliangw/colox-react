import { forwardRef } from 'react';
import clsx from 'clsx';
import type { GridItemProps } from '../../types';
import { withSpanVariable } from '../../utils/style';

/**
 * A child of `Grid`. `span` places the item across columns through an
 * inline custom property (`--colox-grid-item-span: span N`), so
 * arbitrary column counts need no modifier class table.
 */
export const GridItem = forwardRef<HTMLDivElement, GridItemProps>((props, ref) => {
  const { span, className, style: styleProp, children, ...rest } = props;
  const style = withSpanVariable(styleProp, span);

  return (
    <div ref={ref} className={clsx('colox-grid-item', className)} style={style} {...rest}>
      {children}
    </div>
  );
});
