import type { ButtonHTMLAttributes } from 'react';
import type { IconButtonVariants } from '../variants';

export type IconButtonSize = NonNullable<IconButtonVariants['size']>;
export type IconButtonVariant = NonNullable<IconButtonVariants['variant']>;
export type IconButtonIntent = NonNullable<IconButtonVariants['intent']>;

/**
 * The square bare-button primitive for icon-only controls — the reset,
 * token-pinned footprint, focus ring, hover/active feedback and
 * disabled semantics live here, so every call site stops
 * re-hand-rolling them.
 *
 * Accessibility contract: an icon carries no text node, so an icon
 * button is nameless to assistive tech. Consumers must supply an
 * accessible name via `aria-label` (or valid `aria-labelledby`).
 */
export interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /**
   * Footprint size: a preset tier aligned with the form family
   * (xs 24 / sm 32 / md 40 / lg 48) or any theme size-token key —
   * `size="4"` renders a 16px square, `size="0-5"` a 2px one.
   * @default 'md'
   */
  size?: IconButtonSize;
  /**
   * Visual form. Text is the default — pure icon, no resting chrome,
   * context color; ghost tints the icon in the intent color — both
   * show the intent wash on hover; solid/outline carry filled/bordered
   * chrome in the intent color.
   * @default 'text'
   */
  variant?: IconButtonVariant;
  /**
   * Semantic intent — the color family for hover washes, focus ring,
   * and solid/outline paint. Mirrors the Button intent axis.
   * @default 'primary'
   */
  intent?: IconButtonIntent;
  /**
   * Fully-round footprint (circle) instead of the square with small
   * radius. The hover/active wash follows the shape.
   * @default false
   */
  rounded?: boolean;
}

export type IconButtonRef = HTMLButtonElement;
