import { ProgressLinear } from './linear';
import { useProgressStrategy } from './hooks/use-progress-strategy';

/**
 * The progress family: `Progress.Linear` is the horizontal progress
 * bar — parent shape members (`Progress.Circular`) join the same
 * namespace as they ship.
 */
export const Progress = {
  Linear: ProgressLinear,
};

export type ProgressComponent = typeof Progress;

export { useProgressStrategy };
export type {
  ProgressLinearProps,
  ProgressLinearRef,
  ProgressPalette,
  ProgressSize,
  ProgressStrategy,
  ProgressStrategyControls,
  UseProgressStrategyOptions,
} from './types';
export { progressLinearVariants, type ProgressLinearVariants } from './variants';
