import { forwardRef } from 'react';
import type { CSSProperties } from 'react';
import clsx from 'clsx';
import { resolveResponsiveValue, useColoxTheme } from '@colox/theme';
import type { GridItemProps, GridProps } from './types';
import { gridVariants } from './variants';

import './styles/index.scss';

/**
 * The CSS Grid layout primitive: a token-driven track shell. The column
 * count resolves through the theme responsive vocabulary (a static number
 * is the everywhere-form; a per-band config activates at each band) and
 * rides an inline custom property into the single template rule, so
 * arbitrary counts need no modifier class table. Without a provider the
 * theme hook warns and serves static defaults.
 */
const DEFAULT_COLUMNS = 1;

const GridRoot = forwardRef<HTMLDivElement, GridProps>((props, ref) => {
  const { columns, gap, align, justify, className, style, children, ...rest } = props;
  const { breakpoint } = useColoxTheme();
  const resolvedColumns =
    columns === undefined
      ? undefined
      : resolveResponsiveValue(columns, breakpoint, DEFAULT_COLUMNS);
  const perAxisGap = typeof gap === 'object' && gap !== null ? gap : null;
  const gapKey = typeof gap === 'string' ? gap : undefined;
  const classes = gridVariants({
    gap: gapKey,
    rowGap: perAxisGap?.row,
    columnGap: perAxisGap?.column,
    align,
    justify,
  });
  const resolvedStyle =
    resolvedColumns === undefined
      ? style
      : ({ '--colox-grid-columns': resolvedColumns, ...style } as CSSProperties);
  return (
    <div ref={ref} className={clsx(classes, className)} style={resolvedStyle} {...rest}>
      {children}
    </div>
  );
});

const GridItem = forwardRef<HTMLDivElement, GridItemProps>((props, ref) => {
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

type GridComponent = typeof GridRoot & {
  Item: typeof GridItem;
};

export const Grid: GridComponent = Object.assign(GridRoot, { Item: GridItem });
