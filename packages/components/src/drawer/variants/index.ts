import { cva, type VariantProps } from 'class-variance-authority';
import { drawerDirectionStyles } from './direction';
import { drawerSizeStyles } from './size';

export const drawerVariants = cva('colox-drawer__panel', {
  variants: {
    direction: drawerDirectionStyles,
    size: drawerSizeStyles,
  },
  defaultVariants: {
    direction: 'right',
    size: 'md',
  },
});

export type DrawerVariants = VariantProps<typeof drawerVariants>;
