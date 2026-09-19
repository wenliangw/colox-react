import type { ChangeEvent, InputHTMLAttributes } from 'react';
import type { SwitchVariants } from '../variants';

export type SwitchSize = NonNullable<SwitchVariants['size']>;
export type SwitchPalette = NonNullable<SwitchVariants['palette']>;

export interface SwitchProps extends Omit<
  InputHTMLAttributes<HTMLInputElement>,
  'size' | 'type' | 'onChange'
> {
  /**
   * Visual size of the switch row: same-name tiers share the Button/
   * Input/Checkbox design language (row heights 24/32/40/48 and the
   * same font scale), so switch rows sit flush next to same-tier
   * controls.
   * @default 'md'
   */
  size?: SwitchSize;
  /**
   * Palette family for the ON state: the checked track fills the
   * family solid and the focus ring rides its muted pair
   * (primary/gray/info/error/warning/success — the Button families,
   * brand by default). The off state keeps its neutral fabric and
   * `invalid` keeps the red channel.
   * @default 'primary'
   */
  palette?: SwitchPalette;
  /**
   * Marks the switch as invalid (e.g. a required consent step): sets
   * `aria-invalid` and swaps the track border/ring to the red tokens,
   * the same channel as Input/Checkbox. A checked switch keeps its
   * palette fill; the red ring still marks keyboard focus.
   * @default false
   */
  invalid?: boolean;
  /**
   * Fires when the on state toggles — the payload carries the native
   * change event plus the next value (boolean: the switch's on state).
   */
  onChange?: (payload: SwitchChangePayload) => void;
}

/**
 * The switch's change payload: `event` stays the native change event
 * (propagation control), `value` is the next on state (boolean).
 */
export interface SwitchChangePayload {
  event: ChangeEvent<HTMLInputElement>;
  value: boolean;
}

export type SwitchRef = HTMLInputElement;
