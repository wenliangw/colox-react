import { cva, type VariantProps } from 'class-variance-authority';
import { containerAlignStyles } from './align';
import { containerGutterStyles } from './gutter';
import { containerSizeStyles } from './size';

export const containerVariants = cva('colox-container', {
  variants: {
    size: containerSizeStyles,
    gutter: containerGutterStyles,
    align: containerAlignStyles,
  },
  defaultVariants: {
    align: 'center',
  },
});

export type ContainerVariants = VariantProps<typeof containerVariants>;
