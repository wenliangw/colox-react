import { useContext, useId, useLayoutEffect } from 'react';
import { ColoxThemeContext } from '../context';

export const ColoxThemeStorage = () => {
  const { register, unregister } = useContext(ColoxThemeContext);
  const id = useId();

  useLayoutEffect(() => {
    register({ id, kind: 'storage', payload: { enabled: true } });
    return () => unregister(id);
  }, [id, register, unregister]);

  return null;
};
