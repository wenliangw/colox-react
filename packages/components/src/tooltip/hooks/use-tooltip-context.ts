import { useContext, useEffect } from 'react';
import { defaultTooltipContextValue, TooltipContext } from '../context';
import type { TooltipContextValue } from '../types';

/**
 * The protected outlet: the composed parts read the root surface
 * through here. A part mounted without a root gets the no-op default
 * (renders nothing) and warns once per mount — a hook misuse, not a
 * crash (useColoxTheme copy shape).
 */
export function useTooltipContext(): TooltipContextValue {
  const context = useContext(TooltipContext);
  useEffect(() => {
    if (context === defaultTooltipContextValue) {
      console.warn(
        '[Tooltip] useTooltipContext must be used within a <Tooltip> root; static defaults are served.',
      );
    }
  }, [context]);
  return context;
}
