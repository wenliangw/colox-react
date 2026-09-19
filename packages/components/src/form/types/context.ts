import type { SizeKey } from '@colox/theme';
import type { FormLabelPlacement } from './component';
import type { FormStore, FormValidateOn } from './store';

/**
 * What the form publishes to its fields: the store, the validation
 * policy and the layout defaults a field may override.
 */
export interface FormContextValue {
  /** The form's store (the caller's `useForm()` result or the form's own). */
  store: FormStore;
  /** The form-wide validation policy. */
  validateOn: readonly FormValidateOn[];
  /** The form-wide label placement. */
  labelPlacement: FormLabelPlacement;
  /** The form-wide label column width (size token key). */
  labelWidth: SizeKey;
}
