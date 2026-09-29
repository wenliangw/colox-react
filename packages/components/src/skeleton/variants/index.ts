import { cva, type VariantProps } from 'class-variance-authority';
import { skeletonAnimationStyles } from './animation';
import { skeletonButtonSizeStyles, skeletonCircleSizeStyles, skeletonTextSizeStyles } from './size';

export const skeletonVariants = cva('colox-skeleton', {
  variants: {
    animation: skeletonAnimationStyles,
  },
  defaultVariants: {
    animation: 'pulse',
  },
});

export const skeletonTextVariants = cva('colox-skeleton-text', {
  variants: {
    size: skeletonTextSizeStyles,
    animation: skeletonAnimationStyles,
  },
  defaultVariants: {
    size: 'md',
    animation: 'pulse',
  },
});

export const skeletonCircleVariants = cva('colox-skeleton-circle', {
  variants: {
    size: skeletonCircleSizeStyles,
    animation: skeletonAnimationStyles,
  },
  defaultVariants: {
    size: 'md',
    animation: 'pulse',
  },
});

export const skeletonButtonVariants = cva('colox-skeleton-button', {
  variants: {
    size: skeletonButtonSizeStyles,
    animation: skeletonAnimationStyles,
  },
  defaultVariants: {
    size: 'md',
    animation: 'pulse',
  },
});

export type SkeletonVariants = VariantProps<typeof skeletonVariants>;
export type SkeletonTextVariants = VariantProps<typeof skeletonTextVariants>;
export type SkeletonCircleVariants = VariantProps<typeof skeletonCircleVariants>;
export type SkeletonButtonVariants = VariantProps<typeof skeletonButtonVariants>;
