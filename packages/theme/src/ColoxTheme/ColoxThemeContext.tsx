/**
 * ColoxTheme 的 React 订阅面：context 只承载 parts 的注册表；hook 的值
 * 全部来自全局 store（useSyncExternalStore），所以无 Provider 也照常工作
 * ——「无 Provider 自动退化」由单例结构天然保证，不是特判。
 */
import { createContext, useContext, useSyncExternalStore } from 'react';
import { getColoxThemeServerSnapshot, getColoxThemeSnapshot, subscribeColoxTheme } from './store';
import type { ColoxThemeRegistryEntry, ColoxThemeValue } from './types';

export interface ColoxThemeRegistry {
  register: (entry: ColoxThemeRegistryEntry) => void;
  unregister: (id: string) => void;
}

export const ColoxThemeContext = createContext<ColoxThemeRegistry | null>(null);

const inertRegistry: ColoxThemeRegistry = {
  register: () => undefined,
  unregister: () => undefined,
};

export function useColoxThemeRegistry(): ColoxThemeRegistry {
  const registry = useContext(ColoxThemeContext);
  if (registry === null) {
    // parts 必须挂在 <ColoxTheme> 之下；缺席时该 part 被忽略（store 本身不受影响）。
    console.warn('[ColoxTheme] parts must be children of <ColoxTheme>; this part is ignored.');
    return inertRegistry;
  }
  return registry;
}

export const useColoxTheme = (): ColoxThemeValue =>
  useSyncExternalStore(subscribeColoxTheme, getColoxThemeSnapshot, getColoxThemeServerSnapshot);
