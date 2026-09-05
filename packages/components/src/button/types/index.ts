import type { ButtonHTMLAttributes } from 'react';
import type { ButtonVariants } from '../variants';

export type ButtonSize = NonNullable<ButtonVariants['size']>;
export type ButtonVariant = NonNullable<ButtonVariants['variant']>;
export type ButtonIntent = NonNullable<ButtonVariants['intent']>;

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /**
   * Size of the button.
   * @default 'md'
   */
  size?: ButtonSize;
  /**
   * Visual form of the button.
   * @default 'solid'
   */
  variant?: ButtonVariant;
  /**
   * Semantic intent of the button.
   * @default 'brand'
   */
  intent?: ButtonIntent;
}

export type ButtonRef = HTMLButtonElement;
