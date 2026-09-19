import type { HTMLAttributes, LabelHTMLAttributes, ReactNode } from 'react';
import type { SizeKey } from '@colox/theme';
import type { FormLabelPlacement } from './component';
import type { FormValues } from './store';

/**
 * A field: one name in the store, one control, and the label/hint/
 * rules that surround it. It renders the field container (className,
 * style and native attributes land here), wires the label to the
 * control (`htmlFor` for labelable controls, `aria-labelledby` for
 * groups), injects the controlled value/change channel into its single
 * control child and answers for the field's error line.
 */
export interface FormFieldProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
  /** The field name: the key under which the value travels. */
  name: string;
  /** Overrides the form's label placement for this field. */
  labelPlacement?: FormLabelPlacement;
  /** Overrides the form's label column width (size token key). */
  labelWidth?: SizeKey;
  /** A `Form.Label`, one control, and any `Form.Hint` / `Form.Validate` leaves. */
  children: ReactNode;
}

/** The field's label: same words as the native element, wired for you. */
export type FormLabelProps = Omit<LabelHTMLAttributes<HTMLLabelElement>, 'htmlFor'> & {
  children: ReactNode;
};

/** The field's helper line: yields while the field is invalid. */
export interface FormHintProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

/** What a `<Form.Validate>` rule run reports back to its leaf. */
export type FormFieldValidator = (
  value: unknown,
  values: FormValues,
) => string | boolean | undefined | Promise<string | boolean | undefined>;

/**
 * One validation rule (or a small ordered set of rules) for the field
 * it lives in. The first failing rule across the field's leaves shows;
 * the leaf that owns it renders the message. Every rule is optional and
 * they run in the fixed order below — give a leaf one rule when you
 * want one error line per rule.
 */
export interface FormValidateProps {
  /** Fails on an empty value (`''`, `null`, `undefined`, `[]`, `false`). */
  required?: boolean;
  /** Fails when the value does not match (strings and numbers). */
  pattern?: RegExp;
  /** Fails when the numeric value is below the bound. */
  min?: number;
  /** Fails when the numeric value is above the bound. */
  max?: number;
  /** Fails when the text/array is shorter than the bound. */
  minLength?: number;
  /** Fails when the text/array is longer than the bound. */
  maxLength?: number;
  /**
   * A custom rule: return the failure message, `false` for the generic
   * message, or nothing/`true` when it passes. May be async — v1 shows
   * no pending state while it settles.
   */
  validate?: FormFieldValidator;
  /**
   * Overrides the default message of the rules on this leaf (for
   * `validate`, it is the fallback behind `false`).
   */
  message?: string;
  /**
   * Re-runs this field's rules whenever one of these fields changes —
   * the cross-field signal, independent of the `validateOn` policy.
   */
  deps?: readonly string[];
  /**
   * The leaf's declaration index inside the field, injected by
   * `Form.Field` — an error line renders on the leaf that owns the
   * first failing rule.
   * @internal
   */
  ruleIndex?: number;
}

/**
 * The slice of a control's props `Form.Field` reads and injects. The
 * value word switches by domain (`checked` for the boolean leaves,
 * `value` for everything else) and the change/blur channels are the
 * family payload shape.
 * @internal
 */
export interface FormControlProps {
  id?: string;
  name?: string;
  /** The uncontrolled seed the field takes over on mount. */
  defaultValue?: unknown;
  defaultChecked?: unknown;
  /** The controlled words the field injects afterwards. */
  value?: unknown;
  checked?: unknown;
  invalid?: boolean;
  'aria-describedby'?: string;
  'aria-labelledby'?: string;
  /** The family change payload channel the field wraps. */
  onChange?: (payload: unknown) => void;
  onBlur?: (event: unknown) => void;
}

/**
 * What a field publishes to its members: the ids to wire (`htmlFor`,
 * `aria-describedby`), the current error and which leaf owns it.
 */
export interface FormFieldContextValue {
  /** The field name. */
  name: string;
  /** The control's id (also the label's target for labelable controls). */
  controlId: string;
  /** The label's own id, used by the group path (`aria-labelledby`). */
  labelId: string;
  /** The hint line's id. */
  hintId: string;
  /** The error line's id. */
  errorId: string;
  /** Whether the control carries the invalid state right now. */
  invalid: boolean;
  /** The field's current error message. */
  error: string | undefined;
  /** The declaration index of the leaf owning the error (`-1` while valid). */
  errorLeaf: number;
  /** Whether the label is wired through `aria-labelledby` (group controls). */
  labelledBy: boolean;
}
