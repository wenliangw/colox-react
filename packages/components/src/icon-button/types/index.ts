import type { ButtonHTMLAttributes } from 'react';
import type { IconButtonVariants } from '../variants';

export type IconButtonSize = NonNullable<IconButtonVariants['size']>;

/**
 * The square bare-button primitive for icon-only controls — the reset,
 * token-pinned footprint, focus ring and disabled semantics live here,
 * so every call site stops re-hand-rolling them.
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
}

export type IconButtonRef = HTMLButtonElement;
