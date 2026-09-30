import type { HTMLAttributes, ReactNode } from 'react';

/**
 * The animation form — one of the three indicator figures: `spinner`
 * (a round arc turning at a constant pace), `dots` (three dots in a
 * staggered wave), `pulse` (a solid core with two filled bands
 * rippling outward). The axis
 * names the visual motion, so it rides the Skeleton `animation` word
 * rather than `type` — the family word for semantic switching (Empty
 * scenes, Alert statuses).
 */
export type LoadingAnimation = 'spinner' | 'dots' | 'pulse';

/**
 * The indicator footprint: `sm` 16 / `md` 24 / `lg` 32 ride the theme
 * size scale (`--colox-size-4/6/8`), a number pins the exact pixel
 * footprint. The label never follows the size axis.
 */
export type LoadingSize = 'sm' | 'md' | 'lg' | number;

/** The host element of `Loading`. */
export type LoadingRef = HTMLSpanElement;

/**
 * Loading — the inline busy indicator: a decorative motion figure
 * that says "work in progress" without painting a value or a layout.
 * Determinism belongs to `Progress`, placeholding to `Skeleton`. The
 * figure inherits `currentColor` so a spinner dropped into a Button
 * or a tinted line picks the color up for free; the optional `label`
 * rides beside it and doubles as the accessible name — without one,
 * the default name is "Loading" (`aria-label` overrides both). The
 * root announces itself with `role="status"`; children are never
 * wrapped or masked (compose a region overlay out of the bare
 * indicator yourself).
 */
export interface LoadingProps extends HTMLAttributes<HTMLSpanElement> {
  /**
   * The animation figure.
   * @default 'spinner'
   */
  animation?: LoadingAnimation;
  /**
   * The indicator footprint; a number pins the exact pixel size.
   * @default 'md'
   */
  size?: LoadingSize;
  /**
   * The readable label beside the indicator; also the accessible
   * name.
   * @default undefined
   */
  label?: ReactNode;
}
