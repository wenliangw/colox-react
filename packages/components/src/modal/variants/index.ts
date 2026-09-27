import { cva, type VariantProps } from 'class-variance-authority';
import { modalSizeStyles } from './size';

export const modalVariants = cva('colox-modal__panel', {
  variants: {
    size: modalSizeStyles,
  },
  defaultVariants: {
    size: 'md',
  },
});

export type ModalVariants = VariantProps<typeof modalVariants>;
