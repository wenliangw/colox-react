import type { ChangeEvent, InputHTMLAttributes, ReactNode } from 'react';
import type { SliderVariants } from '../variants';

export type SliderSize = NonNullable<SliderVariants['size']>;
export type SliderPalette = NonNullable<SliderVariants['palette']>;

export interface SliderProps extends Omit<
  InputHTMLAttributes<HTMLInputElement>,
  'size' | 'type' | 'value' | 'defaultValue' | 'onChange'
> {
  /**
   * Visual size of the slider row: same-name tiers share the Button/
   * Input/Checkbox/Switch design language (row heights 24/32/40/48 and
   * the same font scale), so slider rows sit flush next to same-tier
   * controls.
   * @default 'md'
   */
  size?: SliderSize;
  /**
   * Palette family for the slider paint: the traveled stripe fills the
   * family solid and the travel edge of the thumb plus the focus ring
   * ride the family pair (primary/gray/info/error/warning/success —
   * the Button families, brand by default). The untraveled stripe and
   * the marks stay neutral.
   * @default 'primary'
   */
  palette?: SliderPalette;
  /**
   * Controlled slider value. Without it the slider is uncontrolled:
   * `defaultValue` seeds it and the native input owns the position.
   */
  value?: number;
  /**
   * Uncontrolled initial value.
   * @default 0
   */
  defaultValue?: number;
  /**
   * The lower bound of the value span.
   * @default 0
   */
  min?: number;
  /**
   * The upper bound of the value span.
   * @default 100
   */
  max?: number;
  /**
   * The smallest value jump: the native step, untouched by marks.
   * @default 1
   */
  step?: number;
  /**
   * Tick marks at the given values with their labels. A key is the
   * slider value, its value renders as the label below the tick — pass
   * `null`/`false` for a bare tick. Marks are a visual layer: the
   * step semantics stay native (`step` is untouched by marks).
   */
  marks?: Record<number, ReactNode>;
  /**
   * Fires on every value change. The slider's value is a commit-heavy
   * numeric contract, so the payload carries both: `event` is the
   * native range change event, `value` the committed number (the
   * native string value parsed for the consumer).
   */
  onChange?: (payload: SliderChangePayload) => void;
}

/**
 * The slider's change payload: `event` stays the native change event
 * (propagation control, the real DOM read), `value` is the committed
 * number already parsed.
 */
export interface SliderChangePayload {
  event: ChangeEvent<HTMLInputElement>;
  value: number;
}

export type SliderRef = HTMLInputElement;
