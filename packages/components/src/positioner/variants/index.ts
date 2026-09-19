import { cva, type VariantProps } from 'class-variance-authority';
import {
  positionerBottomStyles,
  positionerEndStyles,
  positionerStartStyles,
  positionerTopStyles,
} from './offset';
import { positionerPlacementStyles } from './placement';
import { positionerPositionStyles } from './position';

/**
 * The positioned box's class table: which reference it resolves against,
 * where it pins, and how far from the pinned edges.
 */
export const positionerVariants = cva('colox-positioner', {
  variants: {
    position: positionerPositionStyles,
    placement: positionerPlacementStyles,
    fill: {
      true: 'colox-positioner--fill',
    },
    top: positionerTopStyles,
    bottom: positionerBottomStyles,
    start: positionerStartStyles,
    end: positionerEndStyles,
  },
  defaultVariants: {
    position: 'absolute',
  },
});

export type PositionerVariants = VariantProps<typeof positionerVariants>;
