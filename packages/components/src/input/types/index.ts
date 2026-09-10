import type { InputHTMLAttributes, ReactNode } from 'react';
import type { InputVariants } from '../variants';

export type InputSize = NonNullable<InputVariants['size']>;

export interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  /**
   * Visual size of the input.
   * @default 'md'
   */
  size?: InputSize;
  /**
   * Marks the input as invalid (e.g. after server-side validation):
   * sets `aria-invalid` and the red border/ring styling. Native constraint
   * violations (`pattern`/`required`/...) stay on the native `:user-invalid`
   * channel — both share the same red tokens.
   * @default false
   */
  invalid?: boolean;
  /**
   * Content rendered in the leading slot (logical start; RTL-safe). A
   * `type="search"` input without an explicit `leading` renders `IconSearch`
   * here. Icons render at 1em/currentColor, inheriting size and color.
   */
  leading?: ReactNode;
  /**
   * Content rendered in the trailing slot (logical end). Built-in controls
   * (`clearable`, password toggle) are appended after this content.
   */
  trailing?: ReactNode;
  /**
   * Adds a built-in clear button to the trailing slot: clicking it clears
   * the value through the same `onChange` stream (`''`) while keeping focus,
   * and bypasses `filterPattern` (an explicit clear is always allowed).
   * Hidden when `disabled` or `readOnly`.
   * @default false
   */
  clearable?: boolean;
  /**
   * Renders the built-in password visibility toggle in the trailing slot.
   * Active when `true` and `type="password"` only. State-indicating icons:
   * hidden shows the closed eye (`eyeOffIcon`), revealed the open eye
   * (`eyeIcon`).
   * @default false
   */
  allowTogglePassword?: boolean;
  /** Replaces the built-in clear button icon. @default IconX */
  clearIcon?: ReactNode;
  /** Shown while the password is revealed. @default IconEye */
  eyeIcon?: ReactNode;
  /** Shown while the password is hidden. @default IconEyeOff */
  eyeOffIcon?: ReactNode;
  /**
   * Input restriction channel (independent of the native `pattern`, which
   * is the form-validation channel): the value must stay within the pattern
   * language at all times — every user-driven transition that would leave it
   * is rejected (the previous value stays, `onChange` does not fire).
   *
   * Write patterns that accept the partial value: `/^\d*$/` allows an empty
   * field and typing mid-way; `/^\d+$/` would make clearing-by-typing
   * impossible. IME composition is let through unfiltered and the committed
   * value is checked afterwards. Externally fed controlled values violating
   * the pattern are never rewritten.
   */
  filterPattern?: RegExp;
}

export type InputRef = HTMLInputElement;
