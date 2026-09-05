/**
 * ColoxTheme 的四个正交配置面，各站一个纯声明组件（render null）。
 * 它们通过注册表把声明投递给根 <ColoxTheme>，根在 layout effect
 * （绘制前）折叠成最终配置施加到 store。part 的 props 变化即重新
 * 应用；同类多实例 last-write-wins。
 */
import { useId, useLayoutEffect } from 'react';
import { useColoxThemeRegistry } from './ColoxThemeContext';
import type {
  ColoxThemeBreakpointsPartProps,
  ColoxThemePalettePartProps,
  ColoxThemeThemePartProps,
} from './types';

export const ColoxThemeThemePart = ({
  name = 'system',
  defaultTheme = 'light',
}: ColoxThemeThemePartProps) => {
  const { register, unregister } = useColoxThemeRegistry();
  const id = useId();

  useLayoutEffect(() => {
    register({ id, kind: 'theme', payload: { name, defaultTheme } });
    return () => unregister(id);
  }, [id, name, defaultTheme, register, unregister]);

  return null;
};

export const ColoxThemePalettePart = ({ name }: ColoxThemePalettePartProps) => {
  const { register, unregister } = useColoxThemeRegistry();
  const id = useId();

  useLayoutEffect(() => {
    register({ id, kind: 'palette', payload: { name } });
    return () => unregister(id);
  }, [id, name, register, unregister]);

  return null;
};

export const ColoxThemeBreakpointsPart = ({ values }: ColoxThemeBreakpointsPartProps) => {
  const { register, unregister } = useColoxThemeRegistry();
  const id = useId();

  useLayoutEffect(() => {
    register({ id, kind: 'breakpoints', payload: { values } });
    return () => unregister(id);
  }, [id, values, register, unregister]);

  return null;
};

export const ColoxThemeStoragePart = () => {
  const { register, unregister } = useColoxThemeRegistry();
  const id = useId();

  useLayoutEffect(() => {
    register({ id, kind: 'storage', payload: { enabled: true } });
    return () => unregister(id);
  }, [id, register, unregister]);

  return null;
};
