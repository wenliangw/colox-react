import { cva, type VariantProps } from 'class-variance-authority';
import { selectSizeStyles } from './size';

// The variants target the root shell (the form-family visual
// contract); the option rows resolve their own tier from the member's
// size prop or the parent's — not a CVA variant.
export const selectVariants = cva('colox-select', {
  variants: {
    size: selectSizeStyles,
  },
  defaultVariants: {
    size: 'md',
  },
});

export type SelectVariants = VariantProps<typeof selectVariants>;
