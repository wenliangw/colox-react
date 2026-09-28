import type { HTMLAttributes, ReactNode } from 'react';
import type {
  BadgeVariants,
  BadgeDotVariants,
  BadgeCountVariants,
  BadgeItemVariants,
} from '../variants';

export type BadgeSize = NonNullable<BadgeVariants['size']>;
export type BadgeVariant = NonNullable<BadgeVariants['variant']>;
export type BadgePalette = NonNullable<BadgeVariants['palette']>;

/**
 * The pure-display badge family: a standalone capsule (`Badge`), a
 * status dot (`Badge.Dot`), a count capsule (`Badge.Count`) and the
 * seamless multi-segment badge (`Badge.Group` of `Badge.Item`s).
 * Anchoring is not built in — compose `Anchor` (inline) with
 * `Positioner` to pin a badge to a corner of a host element.
 *
 * Axes: `palette` (six design-language families, default gray),
 * `size` (sm/md/lg) and, where the surface has a strength, `variant`
 * (solid/subtle/outline/plain — default solid). The Dot is always a
 * solid point (no strength concept); the Count is always a solid
 * capsule (a count badge is a filled pill).
 */
export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  /**
   * The badge content — text, an icon or any node (the standalone
   * label/pill form).
   */
  children?: ReactNode;
  /**
   * The surface strength: solid (default) the full palette fill,
   * subtle the palette tint, outline a palette ring, plain the quiet
   * neutral surface (palette-independent).
   * @default 'solid'
   */
  variant?: BadgeVariant;
  /**
   * Semantic palette family for the surface.
   * @default 'gray'
   */
  palette?: BadgePalette;
  /**
   * Capsule size.
   * @default 'md'
   */
  size?: BadgeSize;
}

export interface BadgeDotProps extends HTMLAttributes<HTMLSpanElement> {
  /**
   * Semantic palette family for the dot fill.
   * @default 'gray'
   */
  palette?: BadgePalette;
  /**
   * Dot footprint size.
   * @default 'md'
   */
  size?: BadgeSize;
}

export interface BadgeCountProps extends HTMLAttributes<HTMLSpanElement> {
  /**
   * The count to show. Hides when 0 unless `showZero`.
   */
  count: number;
  /**
   * Numeric truncation ceiling — a count above it renders as
   * `${overflowCount}+`.
   * @default 99
   */
  overflowCount?: number;
  /**
   * Show the badge when the count is 0.
   * @default false
   */
  showZero?: boolean;
  /**
   * Semantic palette family for the capsule fill.
   * @default 'gray'
   */
  palette?: BadgePalette;
  /**
   * Capsule size.
   * @default 'md'
   */
  size?: BadgeSize;
}

export interface BadgeGroupProps extends HTMLAttributes<HTMLSpanElement> {
  /**
   * The `Badge.Item` segments — an inline-flex row clipped into one
   * seamless capsule (shared outer radius, no gaps between segments).
   */
  children?: ReactNode;
  /**
   * Round the group's outer corners to the full capsule radius.
   * The default is a square's light rounding (`--colox-radius-sm`).
   * @default false
   */
  rounded?: boolean;
}

export interface BadgeItemProps extends HTMLAttributes<HTMLSpanElement> {
  /**
   * The segment content.
   */
  children?: ReactNode;
  /**
   * The surface strength of this segment (each item paints freely).
   * @default 'solid'
   */
  variant?: BadgeVariant;
  /**
   * Semantic palette family of this segment.
   * @default 'gray'
   */
  palette?: BadgePalette;
  /**
   * Capsule size of this segment.
   * @default 'md'
   */
  size?: BadgeSize;
}

export type BadgeRef = HTMLSpanElement;
export type { BadgeDotVariants, BadgeCountVariants, BadgeItemVariants };
