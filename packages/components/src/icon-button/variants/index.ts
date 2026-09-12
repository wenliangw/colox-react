import { cva, type VariantProps } from 'class-variance-authority';
import { iconButtonIntentStyles } from './intent';
import { iconButtonSizeStyles } from './size';
import { iconButtonVariantStyles } from './variant';

export const iconButtonVariants = cva('colox-icon-button', {
  variants: {
    size: iconButtonSizeStyles,
    variant: iconButtonVariantStyles,
    intent: iconButtonIntentStyles,
    rounded: {
      true: 'colox-icon-button--rounded',
    },
  },
  defaultVariants: {
    size: 'md',
    variant: 'ghost',
    intent: 'primary',
  },
});

export type IconButtonVariants = VariantProps<typeof iconButtonVariants>;
