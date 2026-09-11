import { cva, type VariantProps } from 'class-variance-authority';
import { radioSizeStyles } from './size';

// The variants target the root label (click target and visual
// contract); the inner control stays a bare native input that IS the
// circle, styled via appearance none in the styles layer.
export const radioVariants = cva('colox-radio', {
  variants: {
    size: radioSizeStyles,
  },
  defaultVariants: {
    size: 'md',
  },
});

export type RadioVariants = VariantProps<typeof radioVariants>;
