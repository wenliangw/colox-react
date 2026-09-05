import { createContext } from 'react';
import type { ColoxThemeRegistry } from './types';

const inertRegistry: ColoxThemeRegistry = {
  register: () => undefined,
  unregister: () => undefined,
};

/*
 * Only the registry flows through context; theme state comes from the
 * store subscription. The default value keeps subcomponents safe outside
 * a <ColoxTheme> root — their registrations become no-ops.
 */
export const ColoxThemeContext = createContext<ColoxThemeRegistry>(inertRegistry);
