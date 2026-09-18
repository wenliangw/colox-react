import type { InputHTMLAttributes } from 'react';
import type { SwitchVariants } from '../variants';

export type SwitchSize = NonNullable<SwitchVariants['size']>;

export interface SwitchProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size' | 'type'> {
  /**
   * Visual size of the switch row: same-name tiers share the Button/
   * Input/Checkbox design language (row heights 24/32/40/48 and the
   * same font scale), so switch rows sit flush next to same-tier
   * controls.
   * @default 'md'
   */
  size?: SwitchSize;
  /**
   * Marks the switch as invalid (e.g. a required consent step): sets
   * `aria-invalid` and swaps the track border/ring to the red tokens,
   * the same channel as Input/Checkbox. A checked switch keeps the
   * brand fill; the red ring still marks keyboard focus.
   * @default false
   */
  invalid?: boolean;
}

export type SwitchRef = HTMLInputElement;
