import { cva, type VariantProps } from 'class-variance-authority';
import { iconButtonSizeStyles } from './size';

export const iconButtonVariants = cva('colox-icon-button', {
  variants: {
    size: iconButtonSizeStyles,
  },
  defaultVariants: {
    size: 'md',
  },
});

export type IconButtonVariants = VariantProps<typeof iconButtonVariants>;
