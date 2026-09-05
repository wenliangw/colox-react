import { cva, type VariantProps } from 'class-variance-authority';
import { stackAlignStyles } from './align';
import { stackDirectionStyles } from './direction';
import { stackGapStyles } from './gap';
import { stackJustifyStyles } from './justify';

export const stackVariants = cva('colox-stack', {
  variants: {
    direction: stackDirectionStyles,
    gap: stackGapStyles,
    align: stackAlignStyles,
    justify: stackJustifyStyles,
    wrap: {
      true: 'colox-stack--wrap',
    },
  },
  defaultVariants: {
    direction: 'row',
    align: 'stretch',
    justify: 'start',
  },
});

export const stackItemVariants = cva('colox-stack-item', {
  variants: {
    grow: {
      true: 'colox-stack-item--grow',
    },
  },
});

export type StackVariants = VariantProps<typeof stackVariants>;
export type StackItemVariants = VariantProps<typeof stackItemVariants>;
