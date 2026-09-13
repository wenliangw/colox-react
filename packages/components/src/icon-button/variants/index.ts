import { cva, type VariantProps } from 'class-variance-authority';
import { iconButtonPaletteStyles } from './palette';
import { iconButtonSizeStyles } from './size';
import { iconButtonVariantStyles } from './variant';

export const iconButtonVariants = cva('colox-icon-button', {
  variants: {
    size: iconButtonSizeStyles,
    variant: iconButtonVariantStyles,
    palette: iconButtonPaletteStyles,
    rounded: {
      true: 'colox-icon-button--rounded',
    },
  },
  defaultVariants: {
    size: 'md',
    variant: 'plain',
    palette: 'gray',
  },
});

export type IconButtonVariants = VariantProps<typeof iconButtonVariants>;
