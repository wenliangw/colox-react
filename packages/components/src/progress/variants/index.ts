import { cva, type VariantProps } from 'class-variance-authority';
import { progressLinearPaletteStyles } from './palette';
import { progressLinearSizeStyles } from './size';

export const progressLinearVariants = cva('colox-progress-linear', {
  variants: {
    palette: progressLinearPaletteStyles,
    size: progressLinearSizeStyles,
  },
  defaultVariants: {
    palette: 'primary',
    size: 'md',
  },
});

export type ProgressLinearVariants = VariantProps<typeof progressLinearVariants>;
