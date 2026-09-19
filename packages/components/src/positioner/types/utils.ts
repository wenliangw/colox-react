import type { PositionerOffset, PositionerOffsetKey, PositionerPlacement } from './component';

export interface SplitOffsetParams {
  offset: PositionerOffset | undefined;
  placement: PositionerPlacement | undefined;
}

/**
 * The offset vocabulary split into its four logical edges — the shape
 * the item's class axes consume.
 */
export interface SplitOffsetResult {
  top?: PositionerOffsetKey;
  bottom?: PositionerOffsetKey;
  start?: PositionerOffsetKey;
  end?: PositionerOffsetKey;
}
