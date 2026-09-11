import type { ChangeEvent, HTMLAttributes, InputHTMLAttributes } from 'react';
import type { CheckboxVariants } from '../variants';

export type CheckboxSize = NonNullable<CheckboxVariants['size']>;

export interface CheckboxProps extends Omit<
  InputHTMLAttributes<HTMLInputElement>,
  'size' | 'type' | 'value'
> {
  /**
   * The member value: the form value of this checkbox and — when used
   * inside a `<Checkbox.Group>` without `checked`/`defaultChecked` — the
   * key it contributes to the group's selection array. A member with an
   * explicit `checked`/`defaultChecked` stays independent and `value`
   * only feeds the native form.
   *
   * The native `onChange` event passes through untouched: uncontrolled
   * boxes carry the toggled state on `event.target.checked`; group
   * members are controlled by the group, so the next selection array
   * arrives through `Checkbox.Group`'s `onChange` (the member event is
   * the standard React controlled-input flow).
   */
  value?: string;
  /**
   * Visual size of the checkbox row: same-name tiers share the Button/
   * Input design language (row heights 24/32/40/48 and the same font
   * scale), so checkbox rows sit flush next to same-tier controls.
   * @default 'md'
   */
  size?: CheckboxSize;
  /**
   * Marks the checkbox as invalid: sets `aria-invalid` and swaps the
   * box border/ring to the red tokens (same channel as `Input`).
   * @default false
   */
  invalid?: boolean;
  /**
   * The third visual state: partially-selected (a bar instead of a
   * check). It marks the UI only — `checked` stays the single source
   * of truth for events and form values — and it clears on the next
   * user click, so a "select all" row clicks through to a decided
   * state. Cascade math (how many children are checked) belongs to the
   * consumer.
   * @default false
   */
  indeterminate?: boolean;
}

export type CheckboxRef = HTMLInputElement;

export interface CheckboxGroupProps extends Omit<
  HTMLAttributes<HTMLDivElement>,
  'onChange' | 'defaultValue'
> {
  /**
   * Controlled selection array. Members without their own `checked`/
   * `defaultChecked` derive their state from it.
   */
  value?: string[];
  /** Uncontrolled initial selection array. */
  defaultValue?: string[];
  /**
   * Fires on every member toggle. The payload carries the triggering
   * member's native change event (which checkbox fired, propagation
   * control) alongside the next selection array — the group's
   * `onChange` is its own event face, so it hands over the original
   * event object instead of only the value.
   */
  onChange?: (payload: CheckboxGroupChangePayload) => void;
  /**
   * Visual size inherited by members that don't set their own — a
   * group's members usually share the same tier, so the group carries
   * the axis.
   * @default 'md'
   */
  size?: CheckboxSize;
  /** Disables every member checkbox the group renders. */
  disabled?: boolean;
  /**
   * Native form name inherited by members that don't set their own —
   * the form collects every member under it.
   */
  name?: string;
}

export type CheckboxGroupRef = HTMLDivElement;

/**
 * The group's change payload: `event` is the firing member's native
 * change event, `value` the next selection array.
 */
export interface CheckboxGroupChangePayload {
  /** The triggering member checkbox's native change event. */
  event: ChangeEvent<HTMLInputElement>;
  /** The next selection array after the toggle. */
  value: string[];
}

export interface CheckboxGroupContextValue {
  /** The group's current selection array. */
  value: string[];
  /**
   * The group's selection-change slot: members invoke it with their
   * value and the native change event that fired the toggle (the
   * group's own `onChange` prop is the published `{ event, value }`
   * shape).
   */
  onChange: (value: string, event: ChangeEvent<HTMLInputElement>) => void;
  /** The group `name` members inherit when they set none. */
  name: string;
  /** The group `size` members inherit when they set none. */
  size: CheckboxSize;
  /** The group `disabled` flag members inherit. */
  disabled: boolean;
}
