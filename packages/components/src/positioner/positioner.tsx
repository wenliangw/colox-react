import { forwardRef } from 'react';
import clsx from 'clsx';
import type { PositionerProps } from './types';
import { splitOffset } from './utils/split-offset';
import { positionerVariants } from './variants';

import './styles/index.scss';

/**
 * The positioned box: it leaves the flow, shrink-wraps its children and
 * pins itself to an anchor of its reference box — the nearest positioned
 * ancestor (`Anchor`, or another positioned box) for `absolute`, the
 * viewport for `fixed`. A positioned box is itself a reference for the
 * boxes nested inside it, so frames compose without extra wrappers.
 * Pure CSS: no measurement, no portal, no observers — following an
 * anchor, flipping and collision handling belong to the floating layer.
 */
const PositionerRoot = forwardRef<HTMLDivElement, PositionerProps>((props, ref) => {
  const {
    position = 'absolute',
    placement,
    offset,
    fill = false,
    className,
    children,
    style,
    ...rest
  } = props;
  const edges = splitOffset({ offset, placement });

  // The spacing-key edges ride the class table; the numeric edges are
  // the px escape hatch and render inline (a negative number moves the
  // pinned edge past the reference boundary — the overhang).
  const INSET_PROPERTY: Record<string, string> = {
    top: 'insetBlockStart',
    bottom: 'insetBlockEnd',
    start: 'insetInlineStart',
    end: 'insetInlineEnd',
  };
  const classEdges: Record<string, string> = {};
  const inlineEdges: Record<string, number> = {};
  (Object.keys(edges) as (keyof typeof edges)[]).forEach((edge) => {
    const value = edges[edge];
    if (typeof value === 'number') {
      inlineEdges[INSET_PROPERTY[edge]] = value;
    } else if (value !== undefined) {
      classEdges[edge] = value;
    }
  });

  return (
    <div
      ref={ref}
      className={clsx(positionerVariants({ position, placement, fill, ...classEdges }), className)}
      style={{ ...inlineEdges, ...style }}
      {...rest}
    >
      {children}
    </div>
  );
});

PositionerRoot.displayName = 'Positioner';

export const Positioner = PositionerRoot;
