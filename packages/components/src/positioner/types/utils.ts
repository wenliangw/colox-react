import type { PositionerOffset, PositionerOffsetValue, PositionerPlacement } from './component';

export interface SplitOffsetParams {
  offset: PositionerOffset | undefined;
  placement: PositionerPlacement | undefined;
}

/**
 * The offset vocabulary split into its four logical edges — the shape
 * the item's class axes and inline-style escape hatch consume.
 */
export interface SplitOffsetResult {
  top?: PositionerOffsetValue;
  bottom?: PositionerOffsetValue;
  start?: PositionerOffsetValue;
  end?: PositionerOffsetValue;
}
