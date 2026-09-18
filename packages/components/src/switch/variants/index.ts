import { cva, type VariantProps } from 'class-variance-authority';
import { switchPaletteStyles } from './palette';
import { switchSizeStyles } from './size';

// The variants target the root label (click target and visual
// contract); the inner control stays a bare native input that IS the
// track, styled via appearance none in the styles layer.
export const switchVariants = cva('colox-switch', {
  variants: {
    size: switchSizeStyles,
    palette: switchPaletteStyles,
  },
  defaultVariants: {
    size: 'md',
    palette: 'primary',
  },
});

export type SwitchVariants = VariantProps<typeof switchVariants>;
