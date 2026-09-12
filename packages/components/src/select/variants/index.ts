import { cva, type VariantProps } from 'class-variance-authority';
import { selectSizeStyles } from './size';

// The variants target the root shell (the form-family visual
// contract); the popup row tiers are a separate optionSize axis, not a
// CVA variant — the panel is an independent layout context.
export const selectVariants = cva('colox-select', {
  variants: {
    size: selectSizeStyles,
  },
  defaultVariants: {
    size: 'md',
  },
});

export type SelectVariants = VariantProps<typeof selectVariants>;
