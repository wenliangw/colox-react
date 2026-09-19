import { cva, type VariantProps } from 'class-variance-authority';
import { sliderPaletteStyles } from './palette';
import { sliderSizeStyles } from './size';

// The variants target the root shell (row contract and paint
// variables); the control inside stays a bare native range input.
export const sliderVariants = cva('colox-slider', {
  variants: {
    size: sliderSizeStyles,
    palette: sliderPaletteStyles,
  },
  defaultVariants: {
    size: 'md',
    palette: 'primary',
  },
});

export type SliderVariants = VariantProps<typeof sliderVariants>;
