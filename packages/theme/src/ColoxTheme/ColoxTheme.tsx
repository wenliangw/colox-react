/**
 * ColoxTheme — 组合式主题运行时根组件。
 *
 * <ColoxTheme>
 *   <ColoxTheme.Storage />                          // 持久化：显隐即开关
 *   <ColoxTheme.Palette name="brand-2025" />        // 色板轴（output.name）
 *   <ColoxTheme.Breakpoints values={{ md: '800px' }} /> // 断点：只覆盖值
 *   <ColoxTheme.Theme name="system" />              // 主题：缺席=跟随系统
 *   <App />
 * </ColoxTheme>
 *
 * 四个 part 是纯声明（render null），通过 ColoxThemeContext 的注册表把
 * 配置投递给根；根在 layout effect 折叠成最终配置施加到全局 store（同类
 * 多实例 last-write-wins）。子树不做主题隔离——三轴都写在 <html> 上
 * （:root 前缀选择器契约），<ColoxTheme> 只是同一单例的配置入口。
 */
import { useCallback, useLayoutEffect, useMemo, useState, type FC } from 'react';
import { ColoxThemeContext } from './ColoxThemeContext';
import {
  ColoxThemeBreakpointsPart,
  ColoxThemePalettePart,
  ColoxThemeStoragePart,
  ColoxThemeThemePart,
} from './parts';
import { applyColoxConfig, type ColoxThemeConfigPatch } from './store';
import type { ColoxThemePartKind, ColoxThemeProps, ColoxThemeRegistryEntry } from './types';

const PART_KINDS: ColoxThemePartKind[] = ['storage', 'theme', 'palette', 'breakpoints'];

function foldConfig(entries: ColoxThemeRegistryEntry[]): ColoxThemeConfigPatch {
  const patch: ColoxThemeConfigPatch = {};
  for (const kind of PART_KINDS) {
    const last = [...entries].reverse().find((entry) => entry.kind === kind);
    if (!last) continue;
    switch (last.kind) {
      case 'theme':
        patch.theme = last.payload.name;
        patch.defaultTheme = last.payload.defaultTheme;
        break;
      case 'palette':
        patch.palette = last.payload.name;
        break;
      case 'breakpoints':
        patch.breakpoints = last.payload.values;
        break;
      case 'storage':
        patch.storage = last.payload.enabled;
        break;
    }
  }
  return patch;
}

const ColoxThemeRoot = ({ children }: ColoxThemeProps) => {
  const [entries, setEntries] = useState<ColoxThemeRegistryEntry[]>([]);

  const register = useCallback((entry: ColoxThemeRegistryEntry) => {
    setEntries((prev) => [...prev.filter((item) => item.id !== entry.id), entry]);
  }, []);

  const unregister = useCallback((id: string) => {
    setEntries((prev) => {
      const next = prev.filter((item) => item.id !== id);
      return next.length === prev.length ? prev : next;
    });
  }, []);

  const registry = useMemo(() => ({ register, unregister }), [register, unregister]);

  useLayoutEffect(() => {
    applyColoxConfig(foldConfig(entries));
  }, [entries]);

  return <ColoxThemeContext.Provider value={registry}>{children}</ColoxThemeContext.Provider>;
};

type ColoxThemeComponent = FC<ColoxThemeProps> & {
  Theme: typeof ColoxThemeThemePart;
  Palette: typeof ColoxThemePalettePart;
  Breakpoints: typeof ColoxThemeBreakpointsPart;
  Storage: typeof ColoxThemeStoragePart;
};

export const ColoxTheme: ColoxThemeComponent = Object.assign(ColoxThemeRoot, {
  Theme: ColoxThemeThemePart,
  Palette: ColoxThemePalettePart,
  Breakpoints: ColoxThemeBreakpointsPart,
  Storage: ColoxThemeStoragePart,
});
