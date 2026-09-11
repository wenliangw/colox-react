import type { ChangeEvent, HTMLAttributes, InputHTMLAttributes } from 'react';
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
  /**
   * Fires when the group's selection switches. The payload carries the
   * triggering member's native change event (which radio fired,
   * propagation control) alongside the next selection — the group's
   * `onChange` is its own event face, so it hands over the original
   * event object instead of only the value.
   */
  onChange?: (payload: RadioGroupChangePayload) => void;
  /**
   * Visual size inherited by members that don't set their own — a
   * group's members usually share the same tier, so the group carries
   * the axis.
   * @default 'md'
   */
  size?: RadioSize;
  /** Disables every member radio the group renders. */
  disabled?: boolean;
  /**
   * Native form name inherited by members that don't set their own —
   * the form collects the checked member under it.
   */
  name?: string;
}

export type RadioGroupRef = HTMLDivElement;

/**
 * The group's change payload: `event` is the firing member's native
 * change event, `value` the next single selection.
 */
export interface RadioGroupChangePayload {
  /** The triggering member radio's native change event. */
  event: ChangeEvent<HTMLInputElement>;
  /** The next single selection (`''` while nothing is selected). */
  value: string;
}

export interface RadioGroupContextValue {
  /** The group's current single selection. */
  value: string;
  /**
   * The group's selection-change slot: members invoke it with their
   * value and the native change event that fired the pick (the group's
   * own `onChange` prop is the published `{ event, value }` shape).
   */
  onChange: (value: string, event: ChangeEvent<HTMLInputElement>) => void;
  /** The group `name` members inherit when they set none. */
  name: string;
  /** The group `size` members inherit when they set none. */
  size: RadioSize;
  /** The group `disabled` flag members inherit. */
  disabled: boolean;
}
