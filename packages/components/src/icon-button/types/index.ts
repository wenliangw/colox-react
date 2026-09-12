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
   * Size: a preset tier aligned with the form family (xs 24 / sm 32 /
   * md 40 / lg 48) or any theme size-token key — `size="4"` means
   * 16px, `size="0-5"` 2px. For the text variant (default) the box
   * hugs the icon, so size is the rendered icon size; for ghost/
   * outline/solid it is the footprint of the box.
   * @default 'md'
   */
  size?: IconButtonSize;
  /**
   * Visual form. Text is the default — pure icon, no chrome: the box
   * hugs the icon, `size` sizes the icon itself and the icon is
   * painted in the intent color, darkening to the intent hover/active
   * shade (no background feedback); ghost is the intent-tinted icon
   * with a wash on hover; solid/outline carry filled/bordered chrome
   * in the intent color.
   * @default 'text'
   */
  variant?: IconButtonVariant;
  /**
   * Semantic intent — the color family for the icon, the hover
   * feedback, the focus ring, and the solid/outline paint. Mirrors
   * the Button intent axis.
   * @default 'neutral'
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
