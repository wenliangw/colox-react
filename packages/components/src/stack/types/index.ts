import type { HTMLAttributes } from 'react';
import type { BreakpointName } from '@colox/theme';
import type { StackVariants } from '../variants';

/** Main axis of the stack; row is the CSS-faithful default. */
export type StackDirection = NonNullable<StackVariants['direction']>;
/** Spacing scale keys (the `--colox-spacing-*` theme tokens). */
export type StackGap = NonNullable<StackVariants['gap']>;
export type StackAlign = NonNullable<StackVariants['align']>;
export type StackJustify = NonNullable<StackVariants['justify']>;

/**
 * Per-breakpoint gap overrides for `Stack.Responsive`. Keys are the
 * theme runtime breakpoint names; a value applies whenever the viewport
 * fits the band's max-width cap, so narrow bands override wide ones and
 * `base` (the widest band) is the last fallback.
 */
export type StackResponsiveGap = Partial<Record<BreakpointName, StackGap>>;

export interface StackProps extends HTMLAttributes<HTMLDivElement> {
  /**
   * Main axis direction.
   * @default 'row'
   */
  direction?: StackDirection;
  /**
   * Spacing between children (spacing token key). No gap unless set.
   */
  gap?: StackGap;
  /**
   * Cross-axis alignment (align-items).
   * @default 'stretch'
   */
  align?: StackAlign;
  /**
   * Main-axis distribution (justify-content).
   * @default 'start'
   */
  justify?: StackJustify;
  /**
   * Allow wrapping onto multiple lines.
   * @default false
   */
  wrap?: boolean;
}

export interface StackItemProps extends HTMLAttributes<HTMLDivElement> {
  /**
   * Absorb the free space along the main axis (Spacer semantics).
   * @default false
   */
  grow?: boolean;
}

export interface StackResponsiveProps {
  /**
   * Per-breakpoint gap overrides. The resolved value wins over the
   * Stack `gap` prop while this part is mounted.
   */
  gap: StackResponsiveGap;
}
