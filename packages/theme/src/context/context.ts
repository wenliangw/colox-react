/**
 * ColoxThemeContext carries nothing but the parts registry (register /
 * unregister). Theme state never flows through context — it comes from the
 * global store subscription (see @/hooks/use-colox-theme), and that
 * decoupling is exactly what makes the no-provider degradation structural
 * rather than a special case.
 */
import { createContext } from 'react';
import type { ColoxThemeRegistry } from './types';

export const ColoxThemeContext = createContext<ColoxThemeRegistry | null>(null);
