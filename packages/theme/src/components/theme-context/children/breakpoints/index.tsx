import { useId, useLayoutEffect } from 'react';
import { useColoxTheme } from '../../hooks/use-colox-theme';
import type { ColoxThemeBreakpointsProps } from '../../types';

export const ColoxThemeBreakpoints = ({ values }: ColoxThemeBreakpointsProps) => {
  const { register, unregister } = useColoxTheme();
  const id = useId();

  useLayoutEffect(() => {
    register({ id, kind: 'breakpoints', payload: { values } });
    return () => unregister(id);
  }, [id, values, register, unregister]);

  return null;
};
