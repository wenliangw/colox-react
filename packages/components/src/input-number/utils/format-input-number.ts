import type { NumberValue } from '../types';

// The complete decimal grammar: an optional minus sign followed by
// digits with an optional trailing fraction (or a leading-dot
// fraction). "007" and "-3.14" are complete; "5.", "-" and "" are
// not (mid-edit and empty states resolve separately in the editor).
const COMPLETE_DECIMAL = /^-?(?:\d+\.?\d*|\.\d+)$/;

// The draft grammar: any transition a user can type mid-edit stays
// inside this language — empty, a bare minus, a lone dot, digits with
// a pending dot. Anything else ("1e5", letters, a second dot) is
// rejected at the gate and never lands in the draft.
const DRAFT_DECIMAL = /^-?(?:\d+)?\.?\d*$/;

/**
 * Whether the text is an acceptable mid-edit draft (the gate).
 */
export const isDecimalDraft = (text: string): boolean => DRAFT_DECIMAL.test(text);

/**
 * Whether the text is a complete decimal ready to commit.
 */
export const isCompleteDecimal = (text: string): boolean => COMPLETE_DECIMAL.test(text);

/**
 * Parses a complete decimal draft to its commit value. Returns `null`
 * for any non-complete text (the caller handles the empty-draft case
 * before calling) or when the number is not finite.
 */
export const parseDecimal = (text: string): number | null => {
  if (!isCompleteDecimal(text)) {
    return null;
  }
  const parsed = Number(text);
  return Number.isFinite(parsed) ? parsed : null;
};

/**
 * The decimal places the step carries: stepper results round and
 * render at this precision (`0.01` → 2, `1` → 0) so repeated stepping
 * never drifts into float dust ("0.1 + 0.2" stays "0.3").
 */
export const derivePrecision = (step: number): number => {
  if (!Number.isFinite(step) || step <= 0) {
    return 0;
  }
  const text = String(step);
  const dot = text.indexOf('.');
  return dot === -1 ? 0 : text.length - dot - 1;
};

/**
 * Rounds at the given decimal places (kills float dust on stepper
 * arithmetic).
 */
export const roundToPrecision = (value: number, precision: number): number => {
  const factor = 10 ** precision;
  return Math.round(value * factor) / factor;
};

/**
 * Clamps into the span bounds. `undefined` bounds are open.
 */
export const clampNumber = (value: number, min?: number, max?: number): number => {
  let next = value;
  if (min !== undefined && Number.isFinite(min)) {
    next = Math.max(next, min);
  }
  if (max !== undefined && Number.isFinite(max)) {
    next = Math.min(next, max);
  }
  return next;
};

/**
 * The canonical display string: `null` renders empty; a precision
 * (stepper commits) pads the decimals to the step's places, typed
 * values render verbatim (`String`).
 */
export const formatDecimal = (value: NumberValue, precision?: number): string => {
  if (value === null) {
    return '';
  }
  if (precision !== undefined) {
    return value.toFixed(precision);
  }
  return String(value);
};
