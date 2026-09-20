import type { FormEvent } from 'react';

/** The form's values: field name → the field's current value. */
export type FormValues = Record<string, unknown>;

/** Field name → the first failing rule's message (absent while valid). */
export type FormErrors = Record<string, string | undefined>;

/**
 * When a field's rules run: on submit, on blur, on every committed
 * change, or a mix of them. The policy lives on the form; every field
 * follows it.
 */
export type FormValidateOn = 'submit' | 'blur' | 'change';

/**
 * A rule run's outcome: the first failing rule's message and the
 * declaration index of the `Form.Validate` leaf that owns it (`-1` when
 * the value passes). The leaf index is what lets each leaf render only
 * the error line it owns.
 */
export interface FormFieldVerdict {
  message: string | undefined;
  leaf: number;
}

/**
 * What a field registers with the store: how to run its rules, which
 * fields its validation depends on, and the field's first value (the
 * author's uncontrolled seed or the domain's empty word) — the store
 * re-seeds from it on `reset()` so the restored values match what the
 * controls show. The field owns the rules (they come from its
 * `Form.Validate` leaves) and the store owns when to run them.
 */
export interface FormFieldRegistration {
  /** Runs the field's rule leaves in order; the first message wins. */
  runRules: (value: unknown, values: FormValues) => FormFieldVerdict | Promise<FormFieldVerdict>;
  /**
   * Re-runs the field's rules whenever one of these field names changes
   * — the dependency signal behind `Form.Validate deps`, independent of
   * the `validateOn` policy.
   */
  deps?: readonly string[];
  /**
   * The field's first value: what `reset()` restores when neither the
   * `useForm` initial values nor an explicit `reset(values)` argument
   * covers the field. Initial values and explicit arguments win — the
   * seed is consulted only for fields the restored map does not carry.
   */
  seed?: unknown;
  /**
   * Moves the viewport to the field's control and focuses it (a group
   * scrolls only) — the field's piece of the failed-submit focus
   * behaviour, run by `focusFirstInvalid()`.
   */
  focus?: () => void;
}

/**
 * The form store: the value/error truth behind the Form layer. A form
 * creates one (or receives the consumer's `useForm()` result) and every
 * `Form.Field` talks to it. State reads go through `getValue` /
 * `getError`, writes through `setValue` / `setError` / `reset`, and
 * external consumers can subscribe for re-renders.
 */
export interface FormStore {
  /** The current values, as an object keyed by field name. */
  getValues(): FormValues;
  /** One field's current value. */
  getValue(name: string): unknown;
  /** The current errors, as an object keyed by field name. */
  getErrors(): FormErrors;
  /** One field's current error message (undefined while valid). */
  getError(name: string): string | undefined;
  /**
   * The declaration index of the `Form.Validate` leaf that owns the
   * field's error (`-1` when valid) — how a leaf knows it renders the
   * line. Used by `Form.Validate`.
   */
  getErrorLeaf(name: string): number;
  /** Whether no field currently carries an error. */
  isValid(): boolean;
  /** Writes a value programmatically (no validation runs). */
  setValue(name: string, value: unknown): void;
  /**
   * Batch-loads values — the edit-form backfill behind fetching a record
   * into the form. Only the given keys are written (merged over the
   * current values); no validation runs and nothing is reported to
   * `onValuesChange` — a load is not a user edit.
   */
  setValues(values: FormValues): void;
  /**
   * Writes or clears one field's error message. A message written from
   * outside (a server-side verdict) shows on the field's first
   * `Form.Validate` leaf; a field without any rule leaf has no error
   * line (the control's `invalid`/aria state still marks it).
   */
  setError(name: string, message: string | undefined): void;
  /** Runs every registered field's rules and returns the fresh errors. */
  validate(): Promise<FormErrors>;
  /**
   * Moves the viewport to the first invalid field (fields order) and
   * focuses its control — the failed-submit landing, behind the form's
   * `focusOnInvalid`. Does nothing while the form is valid.
   */
  focusFirstInvalid(): void;
  /**
   * Runs one field's rules and publishes the outcome. A run that started
   * before a newer one (or before `reset()`) settles last is discarded
   * — the store never lets an older verdict overwrite a newer one. The
   * return value is the error as it stands when this run settles.
   */
  validateField(name: string): Promise<string | undefined>;
  /**
   * Restores the initial values (or the given ones) and clears the
   * errors. Fields neither the initial values nor the argument cover
   * return to their registered first value (the control's
   * `defaultValue` / `defaultChecked` seed or the domain's empty word),
   * so the store and the controls show the same thing again.
   */
  reset(nextValues?: FormValues): void;
  /** Subscribes to value/error changes; returns the unsubscribe function. */
  subscribe(listener: () => void): () => void;
  /**
   * Registers a field's rules; returns the unregister function. Used by
   * `Form.Field` — consumers normally let the field do it.
   */
  registerField(name: string, registration: FormFieldRegistration): () => void;
}

/** The valid payload: the submitted values, after every rule passed. */
export interface FormSubmitPayload {
  event: FormEvent<HTMLFormElement>;
  values: FormValues;
}

/** The invalid payload: the errors that blocked the submission. */
export interface FormInvalidPayload {
  event: FormEvent<HTMLFormElement>;
  errors: FormErrors;
}

/**
 * One user edit carried to `onValuesChange`: which field changed, its
 * next value, and the post-change snapshot of all values. Programmatic
 * writes (`setValue`, `setValues`, `reset`) never produce one — the
 * report is the echo of an interaction, not of a load.
 */
export interface FormValuesChangePayload {
  name: string;
  value: unknown;
  values: FormValues;
}
