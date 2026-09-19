import type { ChangeEvent, HTMLAttributes, InputHTMLAttributes } from 'react';
import type { RadioVariants } from '../variants';

export type RadioSize = NonNullable<RadioVariants['size']>;

export interface RadioProps extends Omit<
  InputHTMLAttributes<HTMLInputElement>,
  'size' | 'type' | 'value' | 'onChange'
> {
  /**
   * The member value: the form value of this radio and — when used
   * inside a `<Radio.Group>` without `checked`/`defaultChecked` — the
   * key it contributes to the group's single selection. A member with
   * an explicit `checked`/`defaultChecked` stays independent and
   * `value` only feeds the native form.
   *
   * Group members are controlled by the group: the next single
   * selection arrives through `Radio.Group`'s `onChange`, while the
   * member still fires its own payload with its next checked state.
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
  /**
   * Fires when this radio's own checked state changes — the payload
   * carries the native change event plus the next value (boolean: this
   * radio's selected state). Inside a group the member still fires it,
   * while the group aggregates the next selection on its own channel.
   */
  onChange?: (payload: RadioChangePayload) => void;
}

/**
 * The radio's change payload: `event` stays the native change event
 * (propagation control), `value` is this radio's next checked state — a
 * boolean, because the `value` prop is taken by the member key.
 */
export interface RadioChangePayload {
  event: ChangeEvent<HTMLInputElement>;
  value: boolean;
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
  /**
   * Fires when the group's selection switches. The payload carries the
   * triggering member's native change event (which radio fired,
   * propagation control) alongside the next selection — the group's
   * `onChange` is its own event face, so it hands over the original
   * event object instead of only the value.
   */
  onChange?: (payload: RadioGroupChangePayload) => void;
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
