import { forwardRef } from 'react';
import clsx from 'clsx';
import { resolveResponsiveValue, useColoxTheme } from '@colox/theme';
import { GridItem } from './children/item';
import type { GridProps } from './types';
import { splitGap } from './utils/split-gap';
import { withColumnsVariable } from './utils/style';
import { gridVariants } from './variants';

import './styles/index.scss';

/**
 * The CSS Grid layout primitive: a token-driven track shell. The column
 * count resolves through the theme responsive vocabulary (a static
 * number is the everywhere-form; a per-band config activates at each
 * band) and rides an inline custom property into the single template
 * rule, so arbitrary counts need no modifier class table. Without a
 * provider the theme hook warns and serves static defaults.
 */
const DEFAULT_COLUMNS = 1;

const GridRoot = forwardRef<HTMLDivElement, GridProps>((props, ref) => {
  const { columns: columnsProp, gap, align, justify, className, style, children, ...rest } = props;
  const { breakpoint } = useColoxTheme();
  const columns = resolveResponsiveValue(columnsProp, breakpoint, DEFAULT_COLUMNS);

  return (
    <div
      ref={ref}
      className={clsx(gridVariants({ ...splitGap(gap), align, justify }), className)}
      style={withColumnsVariable(style, columns)}
      {...rest}
    >
      {children}
    </div>
  );
});

type GridComponent = typeof GridRoot & {
  Item: typeof GridItem;
};

export const Grid: GridComponent = Object.assign(GridRoot, { Item: GridItem });
