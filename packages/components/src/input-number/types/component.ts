import type { ChangeEvent, InputHTMLAttributes } from 'react';
import type { InputNumberVariants } from '../variants';

export type InputNumberSize = NonNullable<InputNumberVariants['size']>;

export interface InputNumberProps extends Omit<
  InputHTMLAttributes<HTMLInputElement>,
  'size' | 'type' | 'value' | 'defaultValue' | 'onChange'
> {
  /**
   * Visual size of the number input: same-name tiers share the Button/
   * Input/Checkbox/Switch design language (row heights 24/32/40/48 and
   * the same font scale), so number inputs sit flush next to same-tier
   * controls.
   * @default 'md'
   */
  size?: InputNumberSize;
  /**
   * Marks the input as invalid (e.g. after server-side validation):
   * sets `aria-invalid` and the red border/ring styling.
   * @default false
   */
  invalid?: boolean;
  /**
   * The number value. `null` is the empty state (an empty number input
   * must be expressible). Without `value` the input is uncontrolled:
   * `defaultValue` seeds it and the editor keeps its own state.
   */
  value?: number | null;
  /**
   * Uncontrolled initial value.
   * @default null
   */
  defaultValue?: number | null;
  /**
   * The lower bound of the value span: commits clamp into it — blur
   * pushes an out-of-range typed value back into range and the
   * steppers stop at it. Bounds are editor mechanics, not validation.
   */
  min?: number;
  /** The upper bound of the value span (same mechanics as `min`). */
  max?: number;
  /**
   * The stepping increment for the built-in steppers and the Arrow
   * Up/Down keys. Epsilon values must be positive; the stepper results
   * align their decimals to the step's precision.
   * @default 1
   */
  step?: number;
  /**
   * Fires whenever a complete value commits: the payload carries the
   * native change event plus the parsed number (`null` when emptied).
   * Partial mid-edit drafts ("-", "0.", ".5"…) do not notify — the
   * blur handler instead rolls them back to the last valid value.
   */
  onChange?: (payload: InputNumberChangePayload) => void;
}

/**
 * The number input's commit payload: `event` stays the native change
 * event (synthetic but event-shaped for programmatic commits like
 * stepping and blur clamping), `value` is the committed number
 * already parsed — `null` when the field is empty.
 */
export interface InputNumberChangePayload {
  event: ChangeEvent<HTMLInputElement>;
  value: number | null;
}

export type InputNumberRef = HTMLInputElement;
