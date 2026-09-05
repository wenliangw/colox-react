import { cva, type VariantProps } from 'class-variance-authority';
import { stackAlignStyles } from './align';
import { stackGapStyles } from './gap';
import { stackJustifyStyles } from './justify';

export const hstackVariants = cva('colox-hstack', {
  variants: {
    gap: stackGapStyles,
    align: stackAlignStyles,
    justify: stackJustifyStyles,
    wrap: {
      true: 'colox-hstack--wrap',
    },
  },
  defaultVariants: {
    gap: '2',
    align: 'stretch',
    justify: 'start',
  },
});

export const vstackVariants = cva('colox-vstack', {
  variants: {
    gap: stackGapStyles,
    align: stackAlignStyles,
    justify: stackJustifyStyles,
  },
  defaultVariants: {
    gap: '4',
    align: 'stretch',
    justify: 'start',
  },
});

export type HStackVariants = VariantProps<typeof hstackVariants>;
export type VStackVariants = VariantProps<typeof vstackVariants>;
