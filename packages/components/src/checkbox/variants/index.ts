import { cva, type VariantProps } from 'class-variance-authority';
import { checkboxSizeStyles } from './size';

// The variants target the root label (click target and visual
// contract); the inner control stays a bare native input that IS the
// box, styled via appearance none in the styles layer.
export const checkboxVariants = cva('colox-checkbox', {
  variants: {
    size: checkboxSizeStyles,
  },
  defaultVariants: {
    size: 'md',
  },
});

export type CheckboxVariants = VariantProps<typeof checkboxVariants>;
