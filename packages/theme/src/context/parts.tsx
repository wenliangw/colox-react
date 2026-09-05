/**
 * The four orthogonal config surfaces of ColoxTheme, each a declarative
 * component that renders null. They hand their declarations to the root
 * through the registry; the root folds them into the final config and
 * applies it to the store in a layout effect (before paint). A part's props
 * changing re-applies it; multiple parts of the same kind are
 * last-write-wins.
 */
import { useId, useLayoutEffect } from 'react';
import { LIGHT_THEME_NAME, SYSTEM_THEME_NAME } from '@/constants/theme';
import { useColoxThemeRegistry } from '@/hooks/use-colox-theme-registry';
import type {
  ColoxThemeBreakpointsPartProps,
  ColoxThemePalettePartProps,
  ColoxThemeThemePartProps,
} from './types';

export const ColoxThemeThemePart = ({
  name = SYSTEM_THEME_NAME,
  defaultTheme = LIGHT_THEME_NAME,
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
