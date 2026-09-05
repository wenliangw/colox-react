import { useContext, useId, useLayoutEffect } from 'react';
import { ColoxThemeContext } from '../../context';
import type { ColoxThemeBreakpointsProps } from '../../types';

export const ColoxThemeBreakpoints = ({ values }: ColoxThemeBreakpointsProps) => {
  const { register, unregister } = useContext(ColoxThemeContext);
  const id = useId();

  useLayoutEffect(() => {
    register({ id, kind: 'breakpoints', payload: { values } });
    return () => unregister(id);
  }, [id, values, register, unregister]);

  return null;
};
