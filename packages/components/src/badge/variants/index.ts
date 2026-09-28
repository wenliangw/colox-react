import { cva, type VariantProps } from 'class-variance-authority';
import { badgePaletteStyles } from './palette';
import { badgeDotSizeStyles, badgeSizeStyles } from './size';
import { badgeVariantStyles } from './variant';

export const badgeVariants = cva('colox-badge', {
  variants: {
    size: badgeSizeStyles,
    variant: badgeVariantStyles,
    palette: badgePaletteStyles,
  },
  defaultVariants: {
    size: 'md',
    variant: 'solid',
    palette: 'gray',
  },
});

export const badgeDotVariants = cva('colox-badge-dot', {
  variants: {
    size: badgeDotSizeStyles,
    palette: badgePaletteStyles,
  },
  defaultVariants: {
    size: 'md',
    palette: 'gray',
  },
});

export const badgeCountVariants = cva('colox-badge-count', {
  variants: {
    size: badgeSizeStyles,
    palette: badgePaletteStyles,
  },
  defaultVariants: {
    size: 'md',
    palette: 'gray',
  },
});

export const badgeItemVariants = cva('colox-badge__item', {
  variants: {
    size: badgeSizeStyles,
    variant: badgeVariantStyles,
    palette: badgePaletteStyles,
  },
  defaultVariants: {
    size: 'md',
    variant: 'solid',
    palette: 'gray',
  },
});

export type BadgeVariants = VariantProps<typeof badgeVariants>;
export type BadgeDotVariants = VariantProps<typeof badgeDotVariants>;
export type BadgeCountVariants = VariantProps<typeof badgeCountVariants>;
export type BadgeItemVariants = VariantProps<typeof badgeItemVariants>;
