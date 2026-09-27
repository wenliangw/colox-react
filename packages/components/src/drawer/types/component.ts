import type { HTMLAttributes, ReactNode } from 'react';
import type { InitialFocusTarget } from '@colox/cdk/hooks';
import type { DrawerVariants } from '../variants';

export type DrawerDirection = NonNullable<DrawerVariants['direction']>;
export type DrawerSize = NonNullable<DrawerVariants['size']>;

export interface DrawerProps extends HTMLAttributes<HTMLDivElement> {
  /** Whether the drawer is open. Controlled — there is no defaultVisible. */
  visible: boolean;
  /**
   * The edge the panel slides from. `left`/`right` anchor a vertical
   * panel sized by its width, `top`/`bottom` a horizontal one sized by
   * its height. @default 'right'
   */
  direction?: DrawerDirection;
  /**
   * The content-space tier: the panel's main-axis dimension — the width
   * for `left`/`right`, the height for `top`/`bottom`. sm / md / lg map
   * to the design language's `large_size` WIDTH_HEIGHT tokens
   * (80=320px / 96=384px / 112=448px) — semantic tiers, real token
   * values, no invented numbers. @default 'md'
   */
  size?: DrawerSize;
  /**
   * The width escape hatch (used by `left`/`right`): an explicit width
   * overrides the size tier (a number is treated as px).
   * @default undefined
   */
  width?: number | string;
  /**
   * The height escape hatch (used by `top`/`bottom`): an explicit
   * height overrides the size tier (a number is treated as px).
   * @default undefined
   */
  height?: number | string;
  /**
   * Whether the dim backdrop renders. @default true
   */
  showMask?: boolean;
  /**
   * Whether a pointerdown on the backdrop closes the drawer.
   * @default true
   */
  closeOnMaskClick?: boolean;
  /**
   * Whether the corner close button renders. @default true
   */
  showClose?: boolean;
  /**
   * Where the keyboard focus lands when the drawer opens: the first
   * focusable element or the panel itself. @default 'first'
   */
  initialFocus?: InitialFocusTarget;
  /** The single close channel: the close button, Escape and the mask all call it with false. */
  onVisibleChange?: (visible: boolean) => void;
}

export interface DrawerRef {
  /** The panel DOM node (the trap root). */
  panel: HTMLDivElement | null;
}

export interface DrawerTitleResolved {
  /** The title region content (the Drawer.Title children). */
  node: ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export interface DrawerFooterResolved {
  /** The footer region content (the Drawer.Footer children). */
  node: ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export interface DrawerContentResolved {
  /** The body region content (the Drawer.Content children). */
  node: ReactNode;
  className?: string;
  style?: React.CSSProperties;
}
