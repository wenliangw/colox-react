import type { ButtonHTMLAttributes } from 'react';
import type { ButtonVariants } from '../variants';

export type ButtonSize = NonNullable<ButtonVariants['size']>;
export type ButtonVariant = NonNullable<ButtonVariants['variant']>;
export type ButtonPalette = NonNullable<ButtonVariants['palette']>;

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /**
   * Size of the button.
   * @default 'md'
   */
  size?: ButtonSize;
  /**
   * Visual form of the button — the strength ladder: solid (filled),
   * subtle (tint fill), surface (tint fill + muted ring), outline
   * (border only), ghost (no chrome, wash on hover).
   * @default 'solid'
   */
  variant?: ButtonVariant;
  /**
   * Semantic palette of the button — the color family for the
   * fill/border/text. primary is the brand color.
   * @default 'gray'
   */
  palette?: ButtonPalette;
  /**
   * Adds a theme shadow (shadow-md, lifting to shadow-lg on hover).
   * @default false
   */
  shadow?: boolean;
}

export type ButtonRef = HTMLButtonElement;
