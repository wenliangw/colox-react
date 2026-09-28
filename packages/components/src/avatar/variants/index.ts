import { cva, type VariantProps } from 'class-variance-authority';
import { avatarPaletteStyles } from './palette';
import { avatarShapeStyles } from './shape';
import { avatarSizeStyles } from './size';
import { avatarVariantStyles } from './variant';

export const avatarVariants = cva('colox-avatar', {
  variants: {
    size: avatarSizeStyles,
    shape: avatarShapeStyles,
    variant: avatarVariantStyles,
    palette: avatarPaletteStyles,
  },
  defaultVariants: {
    size: 'md',
    shape: 'circle',
    variant: 'plain',
    palette: 'gray',
  },
});

export type AvatarVariants = VariantProps<typeof avatarVariants>;
