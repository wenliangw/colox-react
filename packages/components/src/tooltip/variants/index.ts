import { cva, type VariantProps } from 'class-variance-authority';
import { tooltipArrowStyles } from './arrow';
import { tooltipSizeStyles } from './size';
import { tooltipVariantStyles } from './variant';

export const tooltipVariants = cva('colox-tooltip__content', {
  variants: {
    variant: tooltipVariantStyles,
    size: tooltipSizeStyles,
    arrow: tooltipArrowStyles,
  },
  defaultVariants: {
    variant: 'dark',
    size: 'md',
    arrow: true,
  },
});

export type TooltipVariants = VariantProps<typeof tooltipVariants>;
