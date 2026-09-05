import { createContext } from 'react';
import type { StackContextValue } from '../types';

const noop = (): undefined => undefined;

/** The static snapshot served when no <Stack> is mounted. */
export const defaultStackContextValue: StackContextValue = {
  registerResponsiveGap: noop,
};

/**
 * The context behind useStackContext, consumed only through that hook
 * and provided only by the <Stack> root.
 */
export const StackContext = createContext<StackContextValue>(defaultStackContextValue);
