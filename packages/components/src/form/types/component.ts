import type { FormHTMLAttributes, ReactNode } from 'react';
import type { SizeKey, SpacingKey } from '@colox/theme';
import type {
  FormInvalidPayload,
  FormStore,
  FormSubmitPayload,
  FormValidateOn,
  FormValues,
  FormValuesChangePayload,
} from './store';

/**
 * Where a field's label sits: `'top'` stacks it above the control,
 * `'start'` puts it in a fixed-width column at the inline start. Both
 * words are logical-axis words (start mirrors under RTL, top does not).
 */
export type FormLabelPlacement = 'top' | 'start';

/**
 * How the label text lines up inside its column behind
 * `labelPlacement="start"`: `'start'` leads, `'end'` trails, `'justify'`
 * spreads the whole line across the column width (the two-to-four
 * character Chinese labels trick). Logical words again — start/end
 * mirror under RTL, justify has no direction. Ignored by the top
 * placement, which has no column to align in.
 */
export type FormLabelAlign = 'start' | 'end' | 'justify';

/**
 * Where a field's required mark sits relative to the label text:
 * `'start'` leads (the `*姓名` pattern), `'end'` trails it. Logical
 * words — the mark mirrors with the writing direction under RTL. The
 * mark itself only shows while some `Form.Validate required` leaf
 * declares the field required; `Form.Label` can hide it per label.
 */
export type FormRequiredMarkPosition = 'start' | 'end';

/**
 * The form root: a `<form>` (native validation off, this layer owns it)
 * laying its fields out in a column through Stack — the family's
 * token-keyed spacing vocabulary, no second layout system. Pairs with
 * `Form.Field` / `Form.Label` / `Form.Hint` / `Form.Validate`, and
 * `useForm` when the consumer wants to hold the store.
 */
export interface FormProps extends Omit<
  FormHTMLAttributes<HTMLFormElement>,
  'onSubmit' | 'onInvalid' | 'noValidate'
> {
  /**
   * An externally held store from `useForm()`. Omitted, the form
   * creates its own — reachable inside through `useFormContext()`.
   */
  form?: FormStore;
  /**
   * The form's initial values while it owns its store — the way a form
   * with no external store declares them (with an external store, pass
   * them to `useForm(initialValues)` instead; this prop is ignored).
   * `reset()` restores back to these.
   */
  initialValues?: FormValues;
  /**
   * When rules run, form-wide: `'submit'`, `'blur'`, `'change'` or a
   * mix. Submit always validates everything; `deps` re-validation
   * always follows its dependency regardless of this policy.
   * @default ['submit', 'blur']
   */
  validateOn?: FormValidateOn | readonly FormValidateOn[];
  /**
   * Where a field's label sits; a field may override it per field.
   * @default 'top'
   */
  labelPlacement?: FormLabelPlacement;
  /**
   * The label column width behind `labelPlacement="start"` — a size
   * token key (`'24'` → `--colox-size-24`), never a px value. Ignored
   * by the top placement.
   * @default '24'
   */
  labelWidth?: SizeKey;
  /**
   * How the label text lines up inside its column when a field's
   * `labelPlacement` is `'start'`; a field may override it per field.
   * Ignored by the top placement (no column to align in).
   * @default 'start'
   */
  labelAlign?: FormLabelAlign;
  /**
   * Where the required mark (the red `*`) sits relative to the label
   * text — `'start'` leads, `'end'` trails; a field may override it per
   * field. The mark shows on every field some `Form.Validate required`
   * leaf declares required; a `Form.Label` can hide its own.
   * @default 'start'
   */
  requiredMarkPosition?: FormRequiredMarkPosition;
  /**
   * The vertical rhythm between fields at the form root — a spacing
   * token key, the same vocabulary Stack speaks. Free-form arrangements
   * (sections, side-by-side rows) compose with Container/Grid/Stack
   * around the fields.
   * @default '4'
   */
  gap?: SpacingKey;
  /**
   * Locks the whole form: every field injects `disabled` into its
   * control. A capability deprivation, so it is sticky — no field can
   * opt back out — the same grammar as the groups' disabled
   * inheritance. An author's own `disabled` on a control still works
   * while the form is not disabled.
   * @default false
   */
  disabled?: boolean;
  /**
   * Whether a failed submit moves the viewport to the first invalid
   * field and focuses its control (the groups scroll only). The error
   * lines alert on their own; this lands the eye on them without
   * scrolling a long form by hand.
   * @default true
   */
  focusOnInvalid?: boolean;
  /** Fires with the collected values once every rule passes. */
  onSubmit?: (payload: FormSubmitPayload) => void;
  /** Fires with the errors when the submit validation fails. */
  onInvalid?: (payload: FormInvalidPayload) => void;
  /**
   * Fires for every user edit — which field changed, its next value and
   * the full post-change snapshot. Behind dependent fields, auto-save
   * and live previews with an edit timestamp; programmatic writes
   * (`setValue` / `setValues` / `reset`) report nothing.
   */
  onValuesChange?: (payload: FormValuesChangePayload) => void;
  children: ReactNode;
}

export type FormRef = HTMLFormElement;
