import { cva, type VariantProps } from 'class-variance-authority';
import { tooltipArrowStyles } from './arrow';
import { tooltipPaletteStyles } from './palette';
import { tooltipSizeStyles } from './size';

export const tooltipVariants = cva('colox-tooltip__content', {
  variants: {
    palette: tooltipPaletteStyles,
    size: tooltipSizeStyles,
    arrow: tooltipArrowStyles,
  },
  defaultVariants: {
    palette: 'gray',
    size: 'md',
    arrow: true,
  },
});

export type TooltipVariants = VariantProps<typeof tooltipVariants>;
