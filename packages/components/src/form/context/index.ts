import { createContext, useContext, useSyncExternalStore } from 'react';
import type { FormContextValue, FormFieldContextValue, FormStore } from '../types';

/**
 * The context behind `<Form>`: every field reads the store, the
 * validation policy and the layout defaults from here. The default is
 * `null` on purpose — a field outside a form is a wiring error, and the
 * hooks say so instead of silently inventing a store.
 */
export const FormContext = createContext<FormContextValue | null>(null);

/**
 * The context behind `<Form.Field>`: ids for wiring, the current error
 * and which `Form.Validate` leaf owns it.
 */
export const FormFieldContext = createContext<FormFieldContextValue | null>(null);

/** The form context; throws outside a `<Form>`. */
export function useFormContext(): FormContextValue {
  const context = useContext(FormContext);
  if (context === null) {
    throw new Error('Form members must be rendered inside a <Form>.');
  }
  return context;
}

/** The field context; throws outside a `<Form.Field>`. */
export function useFormFieldContext(): FormFieldContextValue {
  const context = useContext(FormFieldContext);
  if (context === null) {
    throw new Error(
      'Form.Label / Form.Hint / Form.Validate must be rendered inside a <Form.Field>.',
    );
  }
  return context;
}

/** Subscribes to one field's value; re-renders when it changes. */
export function useFormValue(store: FormStore, name: string): unknown {
  return useSyncExternalStore(
    store.subscribe,
    () => store.getValue(name),
    () => store.getValue(name),
  );
}

/** Subscribes to one field's error; re-renders when the message changes. */
export function useFormError(store: FormStore, name: string): string | undefined {
  return useSyncExternalStore(
    store.subscribe,
    () => store.getError(name),
    () => store.getError(name),
  );
}

/** Subscribes to the leaf index owning the field's error. */
export function useFormErrorLeaf(store: FormStore, name: string): number {
  return useSyncExternalStore(
    store.subscribe,
    () => store.getErrorLeaf(name),
    () => store.getErrorLeaf(name),
  );
}
