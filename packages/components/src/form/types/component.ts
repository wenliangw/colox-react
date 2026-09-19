import type { FormHTMLAttributes, ReactNode } from 'react';
import type { SizeKey, SpacingKey } from '@colox/theme';
import type { FormInvalidPayload, FormStore, FormSubmitPayload, FormValidateOn } from './store';

/**
 * Where a field's label sits: `'top'` stacks it above the control,
 * `'start'` puts it in a fixed-width column at the inline start. Both
 * words are logical-axis words (start mirrors under RTL, top does not).
 */
export type FormLabelPlacement = 'top' | 'start';

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
   * The vertical rhythm between fields at the form root — a spacing
   * token key, the same vocabulary Stack speaks. Free-form arrangements
   * (sections, side-by-side rows) compose with Container/Grid/Stack
   * around the fields.
   * @default '4'
   */
  gap?: SpacingKey;
  /** Fires with the collected values once every rule passes. */
  onSubmit?: (payload: FormSubmitPayload) => void;
  /** Fires with the errors when the submit validation fails. */
  onInvalid?: (payload: FormInvalidPayload) => void;
  children: ReactNode;
}

export type FormRef = HTMLFormElement;
