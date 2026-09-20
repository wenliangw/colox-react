import { useRef } from 'react';
import type {
  FormErrors,
  FormFieldRegistration,
  FormFieldVerdict,
  FormStore,
  FormValues,
} from '../types';
import { buildErrorsTree, buildValuesTree, normalizeValues } from '../utils/nested-values';

const PASSED: FormFieldVerdict = { message: undefined, leaf: -1 };

/**
 * Builds the form store. State is held in closure variables (values and
 * errors are replaced, never mutated) and readers subscribe through
 * `subscribe` — `useSyncExternalStore` in the hooks that need to
 * re-render. The store is deliberately small: values, errors (plus the
 * leaf each error came from), rule registration and the validation
 * runners.
 *
 * Names are dotted paths (`'user.name'`) stored flat inside — every
 * mechanism (epochs, deps, registration) works on flat names — while
 * the read facade (`getValues` / `getErrors`) rebuilds the nested tree
 * the consumer authored. The tree is cached and only rebuilt after a
 * write, so `useSyncExternalStore` snapshots stay stable between
 * writes.
 */
function createFormStore(initialValues: FormValues): FormStore {
  const initial: FormValues = normalizeValues(initialValues);
  let values: FormValues = { ...initial };
  let errors: FormErrors = {};
  let errorLeaves: Record<string, number> = {};
  let valuesTree: FormValues | undefined;
  let errorsTree: FormErrors | undefined;
  const fields = new Map<string, FormFieldRegistration>();
  const listeners = new Set<() => void>();
  // The per-field run counters behind the async guard: each run takes
  // the next number, and only the latest run may publish — an older
  // run settling later (slow async rule, change-triggered overlaps,
  // reset mid-flight) is discarded instead of overriding a fresher
  // verdict with stale truth.
  const versions = new Map<string, number>();

  const invalidateTrees = () => {
    valuesTree = undefined;
    errorsTree = undefined;
  };

  const emit = () => {
    for (const listener of listeners) {
      listener();
    }
  };

  const publish = (name: string, verdict: FormFieldVerdict) => {
    const leaf = verdict.message === undefined ? -1 : verdict.leaf;
    if (errors[name] === verdict.message && errorLeaves[name] === leaf) {
      return;
    }
    errors = { ...errors, [name]: verdict.message };
    errorLeaves = { ...errorLeaves, [name]: leaf };
    invalidateTrees();
    emit();
  };

  const validateField = async (name: string): Promise<string | undefined> => {
    const field = fields.get(name);
    if (field === undefined) {
      return errors[name];
    }
    const version = (versions.get(name) ?? 0) + 1;
    versions.set(name, version);
    const verdict = await field.runRules(values[name], getValues());
    if (versions.get(name) !== version) {
      // A newer run (or a reset clearing errors) superseded this one —
      // report the live truth, publish nothing.
      return errors[name];
    }
    publish(name, verdict);
    return verdict.message;
  };

  // The dependency signal: a value change re-runs every field that
  // declared it as a dependency, whatever the validateOn policy says.
  const runDependents = (changed: string) => {
    for (const [name, field] of fields) {
      if (name !== changed && field.deps?.includes(changed)) {
        void validateField(name);
      }
    }
  };

  // The read facade: nested trees rebuilt from the flat names and cached
  // until the next write (stable snapshots for useSyncExternalStore).
  // Mutating the returned tree never touches the store.
  const getValues = (): FormValues => (valuesTree ??= buildValuesTree(values));
  const getErrors = (): FormErrors => (errorsTree ??= buildErrorsTree(errors));

  return {
    getValues,
    getValue: (name) => values[name],
    getErrors,
    getError: (name) => errors[name],
    getErrorLeaf: (name) => errorLeaves[name] ?? -1,
    isValid: () => Object.values(errors).every((message) => message === undefined),
    setValue: (name, value) => {
      if (Object.is(values[name], value)) {
        return;
      }
      values = { ...values, [name]: value };
      invalidateTrees();
      emit();
      runDependents(name);
    },
    setValues: (nextValues) => {
      // The edit-form backfill: only the given keys are written (merged
      // over the current values), no validation runs (deps included)
      // and nothing reports to onValuesChange — a load is not a user
      // edit. Nested spellings flatten into dotted names on the way in.
      values = { ...values, ...normalizeValues(nextValues) };
      invalidateTrees();
      emit();
    },
    setError: (name, message) => {
      // An error written from outside has no rule to blame: it shows on
      // the field's first rule leaf (or nowhere when it declared none).
      const hasRules = fields.get(name)?.runRules !== undefined;
      publish(name, message === undefined ? PASSED : { message, leaf: hasRules ? 0 : -1 });
    },
    validate: async () => {
      for (const name of [...fields.keys()]) {
        await validateField(name);
      }
      return getErrors();
    },
    validateField,
    focusFirstInvalid: () => {
      for (const [name, registration] of fields) {
        if (errors[name] !== undefined) {
          registration.focus?.();
          return;
        }
      }
    },
    reset: (nextValues) => {
      // Fields the restored map does not cover return to their first
      // value — the control's declared seed — so the store reads the
      // same thing the controls show again. Initial values (and the
      // explicit argument) win over control seeds.
      const restored = normalizeValues(nextValues ?? initial);
      const seeds: FormValues = {};
      for (const [name, registration] of fields) {
        if (restored[name] === undefined && registration.seed !== undefined) {
          seeds[name] = registration.seed;
        }
      }
      values = { ...restored, ...seeds };
      errors = {};
      errorLeaves = {};
      invalidateTrees();
      // Discard in-flight rule runs: whatever settles now is validating
      // a state that no longer exists and must not publish after the
      // cleared map it would contradict.
      for (const name of fields.keys()) {
        versions.set(name, (versions.get(name) ?? 0) + 1);
      }
      emit();
    },
    unregister: (name) => {
      fields.delete(name);
      // Unmounting keeps the values (the preserve habit); unregistering
      // is the explicit drop — rules, value and error all gone.
      if (
        values[name] !== undefined ||
        errors[name] !== undefined ||
        errorLeaves[name] !== undefined
      ) {
        const nextValues = { ...values };
        delete nextValues[name];
        values = nextValues;
        const nextErrors = { ...errors };
        delete nextErrors[name];
        errors = nextErrors;
        const nextLeaves = { ...errorLeaves };
        delete nextLeaves[name];
        errorLeaves = nextLeaves;
        invalidateTrees();
        // An in-flight rule run on this field must not publish after the
        // drop either.
        versions.set(name, (versions.get(name) ?? 0) + 1);
        emit();
      }
    },
    subscribe: (listener) => {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
    registerField: (name, registration) => {
      fields.set(name, registration);
      return () => {
        if (fields.get(name) === registration) {
          fields.delete(name);
        }
      };
    },
  };
}

/**
 * Creates the form store. Call it once and hand the result to
 * `<Form form={store}>` when the consumer needs the store outside the
 * tree (imperative validate/reset, reading values in a toolbar);
 * otherwise omit it and the form holds its own.
 */
export function useForm(initialValues: FormValues = {}): FormStore {
  const ref = useRef<FormStore | null>(null);
  if (ref.current === null) {
    ref.current = createFormStore(initialValues);
  }
  return ref.current;
}
