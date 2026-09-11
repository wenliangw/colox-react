import type { HTMLAttributes, InputHTMLAttributes } from 'react';
import type { RadioVariants } from '../variants';

export type RadioSize = NonNullable<RadioVariants['size']>;

export interface RadioProps extends Omit<
  InputHTMLAttributes<HTMLInputElement>,
  'size' | 'type' | 'value'
> {
  /**
   * The member value: the form value of this radio and — when used
   * inside a `<Radio.Group>` without `checked`/`defaultChecked` — the
   * key it contributes to the group's single selection. A member with
   * an explicit `checked`/`defaultChecked` stays independent and
   * `value` only feeds the native form.
   *
   * The native `onChange` event passes through untouched: uncontrolled
   * radios carry the toggled state on `event.target.checked`; group
   * members are controlled by the group, so the next selection arrives
   * through `Radio.Group`'s `onChange` (the member event is the
   * standard React controlled-input flow).
   */
  value?: string;
  /**
   * Visual size of the radio row: same-name tiers share the Button/
   * Input/Checkbox design language (row heights 24/32/40/48 and the
   * same font scale), so radio rows sit flush next to same-tier
   * controls.
   * @default 'md'
   */
  size?: RadioSize;
  /**
   * Marks the radio as invalid: sets `aria-invalid` and swaps the
   * circle border/ring to the red tokens (same channel as `Input`).
   * It paints the unfilled state only — a selected radio keeps its
   * brand ring (same visual priority as Checkbox).
   * @default false
   */
  invalid?: boolean;
}

export type RadioRef = HTMLInputElement;

export interface RadioGroupProps extends Omit<
  HTMLAttributes<HTMLDivElement>,
  'onChange' | 'defaultValue'
> {
  /**
   * Controlled selection: the member whose `value` equals this is
   * checked. Members without their own `checked`/`defaultChecked`
   * derive their state from it.
   */
  value?: string;
  /** Uncontrolled initial selection. */
  defaultValue?: string;
  /** Fires with the next selection when the radio group switches. */
  onChange?: (value: string) => void;
  /** Disables every member radio the group renders. */
  disabled?: boolean;
  /**
   * Native form name inherited by members that don't set their own —
   * the form collects the checked member under it.
   */
  name?: string;
}

export type RadioGroupRef = HTMLDivElement;

export interface RadioGroupContextValue {
  /** The group's current single selection. */
  value: string;
  /** Selects a member value as the group's selection. */
  selectValue: (value: string) => void;
  /** The group `name` members inherit when they set none. */
  name: string;
  /** The group `disabled` flag members inherit. */
  groupDisabled: boolean;
}
