import { useLayoutEffect } from 'react';
import type { RefObject } from 'react';

export interface UseIndeterminateParams {
  inputRef: RefObject<HTMLInputElement | null>;
  indeterminate: boolean;
}

/**
 * Mirrors the `indeterminate` prop onto the native input's DOM
 * property. Indeterminate exists only as a DOM property (not an HTML
 * attribute), so React cannot set it through JSX — the effect writes
 * it directly before paint whenever the prop changes, keeping the
 * controlled surface declarative.
 */
export function useIndeterminate({ inputRef, indeterminate }: UseIndeterminateParams) {
  useLayoutEffect(() => {
    if (inputRef.current) {
      inputRef.current.indeterminate = indeterminate;
    }
  }, [inputRef, indeterminate]);
}
