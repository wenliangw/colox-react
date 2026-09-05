import { useId, useLayoutEffect } from 'react';
import { useColoxTheme } from '../../hooks/use-colox-theme';

export const ColoxThemeStorage = () => {
  const { register, unregister } = useColoxTheme();
  const id = useId();

  useLayoutEffect(() => {
    register({ id, kind: 'storage', payload: { enabled: true } });
    return () => unregister(id);
  }, [id, register, unregister]);

  return null;
};
