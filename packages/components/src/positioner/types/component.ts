import type { HTMLAttributes } from 'react';
import type { PositionerVariants } from '../variants';

/**
 * How the positioned box resolves its reference: `absolute` against the
 * nearest positioned ancestor (an `Anchor`, or a positioned box), or
 * `fixed` against the viewport.
 */
export type PositionerPosition = 'absolute' | 'fixed';

/**
 * Where the box is pinned inside its reference box. The block axis keeps
 * the physical `top`/`bottom` words (they do not mirror), the inline
 * axis uses the logical `start`/`end` words (RTL-safe) — the same word
 * family the offset keys and the layout components speak.
 */
export type PositionerPlacement =
  | 'top-start'
  | 'top'
  | 'top-end'
  | 'start'
  | 'center'
  | 'end'
  | 'bottom-start'
  | 'bottom'
  | 'bottom-end';

/** A spacing scale key — the offset vocabulary (theme token grid). */
export type PositionerOffsetKey = NonNullable<PositionerVariants['top']>;

/**
 * The distance from the pinned edges: one spacing key sets every edge
 * the placement pins, an object sets each edge on its own.
 */
export type PositionerOffset =
  | PositionerOffsetKey
  | {
      top?: PositionerOffsetKey;
      bottom?: PositionerOffsetKey;
      start?: PositionerOffsetKey;
      end?: PositionerOffsetKey;
    };

/**
 * The positioned box: it leaves the flow, shrink-wraps its children and
 * pins itself to an anchor of its reference box — the nearest positioned
 * ancestor (`Anchor`, or another positioned box) for `absolute`, the
 * viewport for `fixed`.
 */
export interface PositionerProps extends HTMLAttributes<HTMLDivElement> {
  /**
   * How the box resolves its reference.
   * @default 'absolute'
   */
  position?: PositionerPosition;
  /**
   * Where the box is pinned inside its reference box. Without it the box
   * is positioned with auto insets — pair it with `offset` to pin edges
   * explicitly, or use `fill`.
   */
  placement?: PositionerPlacement;
  /**
   * Distance from the pinned edges: one spacing key sets every edge the
   * placement pins, an object sets each edge on its own. An edge the
   * object names is pinned even when the placement left it unanchored
   * (CSS-faithful stretch / two-edge anchoring).
   */
  offset?: PositionerOffset;
  /**
   * Cover the whole reference box (`inset: 0`) — the scrim/overlay preset
   * (a full-viewport layer with `position="fixed"`).
   */
  fill?: boolean;
}

export type PositionerRef = HTMLDivElement;
