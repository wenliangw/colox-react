import { cva, type VariantProps } from 'class-variance-authority';
import { popoverArrowStyles } from './arrow';

export const popoverVariants = cva('colox-popover__panel', {
  variants: {
    arrow: popoverArrowStyles,
  },
  defaultVariants: {
    arrow: true,
  },
});

export type PopoverVariants = VariantProps<typeof popoverVariants>;
