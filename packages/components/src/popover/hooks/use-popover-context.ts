import { useContext, useEffect } from 'react';
import { defaultPopoverContextValue, PopoverContext } from '../context';
import type { PopoverContextValue } from '../types';

/**
 * The protected outlet: the composed parts read the root surface
 * through here. A part mounted without a root gets the no-op default
 * (renders nothing) and warns once per mount — a hook misuse, not a
 * crash (useColoxTheme copy shape).
 */
export function usePopoverContext(): PopoverContextValue {
  const context = useContext(PopoverContext);
  useEffect(() => {
    if (context === defaultPopoverContextValue) {
      console.warn(
        '[Popover] usePopoverContext must be used within a <Popover> root; static defaults are served.',
      );
    }
  }, [context]);
  return context;
}
