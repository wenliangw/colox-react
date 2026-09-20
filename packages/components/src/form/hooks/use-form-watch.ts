import { useSyncExternalStore } from 'react';
import type { FormStore, FormValues } from '../types';

/**
 * Subscribes to form values and re-renders when they change: with a
 * name it watches one field, without it the whole values map — the
 * whole-map form drives auto-save and dirty checks, the named form
 * drives dependent fields and live previews (the "conditional field"
 * interactions). Reads only. The snapshot is the store's immutable map
 * or one field's value, stable between writes.
 */
export function useFormWatch(store: FormStore): FormValues;
export function useFormWatch(store: FormStore, name: string): unknown;
export function useFormWatch(store: FormStore, name?: string): FormValues | unknown {
  // One unconditional hook call: an early return would make the hook
  // order depend on whether the caller passed a name, which is a real
  // hooks violation, not a lint false positive.
  return useSyncExternalStore(store.subscribe, () =>
    name === undefined ? store.getValues() : store.getValue(name),
  );
}

/**
 * Subscribes to one field's error and re-renders when the message
 * changes — a summary pane or a submit toolbar counting the broken
 * fields, without touching the rules. Reads only.
 */
export function useFormWatchError(store: FormStore, name: string): string | undefined {
  return useSyncExternalStore(store.subscribe, () => store.getError(name));
}
