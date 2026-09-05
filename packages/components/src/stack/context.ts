import { createContext } from 'react';
import type { StackGap } from './types';

/**
 * Internal channel between `Stack` and its `Stack.Responsive` parts.
 * The Stack owns the resolved gap; Responsive parts resolve the config
 * against the theme runtime breakpoint and push the value (last
 * mounted writer wins, unmounting restores the static gap prop).
 */
export interface StackContextValue {
  registerResponsiveGap: (gap: StackGap | undefined) => void;
}

export const StackContext = createContext<StackContextValue | null>(null);
