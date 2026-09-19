import { useRef } from 'react';
import type {
  FormErrors,
  FormFieldRegistration,
  FormFieldVerdict,
  FormStore,
  FormValues,
} from '../types';

const PASSED: FormFieldVerdict = { message: undefined, leaf: -1 };

/**
 * Builds the form store. State is held in closure variables (values and
 * errors are replaced, never mutated) and readers subscribe through
 * `subscribe` — `useSyncExternalStore` in the hooks that need to
 * re-render. The store is deliberately small: values, errors (plus the
 * leaf each error came from), rule registration and the validation
 * runners.
 */
function createFormStore(initialValues: FormValues): FormStore {
  const initial: FormValues = { ...initialValues };
  let values: FormValues = { ...initialValues };
  let errors: FormErrors = {};
  let errorLeaves: Record<string, number> = {};
  const fields = new Map<string, FormFieldRegistration>();
  const listeners = new Set<() => void>();

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
    emit();
  };

  const validateField = async (name: string): Promise<string | undefined> => {
    const field = fields.get(name);
    if (field === undefined) {
      return errors[name];
    }
    const verdict = await field.runRules(values[name], values);
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

  return {
    getValues: () => values,
    getValue: (name) => values[name],
    getErrors: () => errors,
    getError: (name) => errors[name],
    getErrorLeaf: (name) => errorLeaves[name] ?? -1,
    isValid: () => Object.values(errors).every((message) => message === undefined),
    setValue: (name, value) => {
      if (Object.is(values[name], value)) {
        return;
      }
      values = { ...values, [name]: value };
      emit();
      runDependents(name);
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
      return errors;
    },
    validateField,
    reset: (nextValues) => {
      values = { ...(nextValues ?? initial) };
      errors = {};
      errorLeaves = {};
      emit();
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
