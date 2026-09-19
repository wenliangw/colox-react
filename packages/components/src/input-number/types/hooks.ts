import type { ChangeEventHandler, FocusEventHandler, KeyboardEventHandler, RefObject } from 'react';
import type { InputNumberChangePayload } from './component';
import type { NumberValue } from './utils';

export interface UseInputNumberParams {
  /** The native input this editor drives (refs the DOM reads). */
  inputRef: RefObject<HTMLInputElement | null>;
  /** Controlled value; `undefined` means uncontrolled. */
  value: number | null | undefined;
  /** Uncontrolled seed value. */
  defaultValue: number | null | undefined;
  /** Lower span bound used when committing (clamp + stepper base). */
  min: number | undefined;
  /** Upper span bound used when committing (clamp + stepper base). */
  max: number | undefined;
  /** Stepping increment; non-positive values fall back to `1`. */
  step: number;
  /** The consumer's `onChange` — the only commit notification path. */
  onChange: ((payload: InputNumberChangePayload) => void) | undefined;
  /** The consumer's native blur handler, appended after the internal
   *  rollback/clamp bookkeeping. */
  onBlur: FocusEventHandler<HTMLInputElement> | undefined;
  /** The consumer's native key handler, appended after the internal
   *  Arrow Up/Down stepping. */
  onKeyDown: KeyboardEventHandler<HTMLInputElement> | undefined;
}

export interface UseInputNumberResult {
  /** The committed value (controlled or internal state). */
  current: NumberValue;
  /** The displayed string: typed drafts verbatim, canonical after
   *  commits and blur normalization. */
  draft: string;
  /** The input's change handler (gate → draft → commit). */
  handleChange: ChangeEventHandler<HTMLInputElement>;
  /** Blur bookkeeping: roll back partial drafts, clamp out-of-range
   *  values, normalize the display. */
  handleBlur: FocusEventHandler<HTMLInputElement>;
  /** Arrow Up/Down stepping (preventDefault), then the consumer's
   *  handler. */
  handleKeyDown: KeyboardEventHandler<HTMLInputElement>;
  /** The stepper action: `1` increases, `-1` decreases. */
  handleStep: (direction: 1 | -1) => void;
}
