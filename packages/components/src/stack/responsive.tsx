import { useContext, useEffect } from 'react';
import { useColoxTheme } from '@colox/theme';
import { StackContext } from './context';
import { resolveResponsiveGap } from './resolve';
import type { StackResponsiveProps } from './types';

/**
 * Mounted capability for `Stack`: resolves the per-breakpoint gap
 * config against the theme runtime breakpoint and registers the result
 * with the enclosing Stack, rendering nothing. Only the mounted part
 * touches the theme context, so a static Stack stays context-free; the
 * last mounted instance wins and unmounting restores the static gap.
 */
export const StackResponsive = ({ gap }: StackResponsiveProps) => {
  const context = useContext(StackContext);
  const { breakpoint } = useColoxTheme();
  const resolvedGap = resolveResponsiveGap(gap, breakpoint);

  useEffect(() => {
    context?.registerResponsiveGap(resolvedGap);
    return () => context?.registerResponsiveGap(undefined);
  }, [context, resolvedGap]);

  return null;
};
