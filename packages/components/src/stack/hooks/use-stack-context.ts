import { useContext, useEffect } from 'react';
import { defaultStackContextValue, StackContext } from '../context';
import type { StackContextValue } from '../types';

/**
 * The single protected outlet for the Stack context: parts read the
 * registration command through it — no part consumes StackContext
 * directly. Outside a <Stack> it warns once per mount and serves static
 * defaults, so registration becomes a no-op.
 */
export const useStackContext = (): StackContextValue => {
  const context = useContext(StackContext);
  useEffect(() => {
    if (context === defaultStackContextValue) {
      console.warn(
        '[Stack] useStackContext must be used within a <Stack>; static defaults are served.',
      );
    }
  }, [context]);
  return context;
};
