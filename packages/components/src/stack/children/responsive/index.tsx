import { useEffect } from 'react';
import { resolveResponsiveValue, useColoxTheme } from '@colox/theme';
import { useStackContext } from '../../hooks/use-stack-context';
import type { StackResponsiveProps } from '../../types';

/**
 * Mounted capability for `Stack`: resolves the per-breakpoint gap
 * config against the theme runtime breakpoint and registers the result
 * with the enclosing Stack, rendering nothing. Only the mounted part
 * touches the theme context, so a static Stack stays context-free; the
 * last mounted instance wins and unmounting restores the static gap.
 */
export const StackResponsive = ({ gap }: StackResponsiveProps) => {
  const { registerResponsiveGap } = useStackContext();
  const { breakpoint } = useColoxTheme();
  const resolvedGap = resolveResponsiveValue(gap, breakpoint);

  useEffect(() => {
    registerResponsiveGap(resolvedGap);
    return () => registerResponsiveGap(undefined);
  }, [registerResponsiveGap, resolvedGap]);

  return null;
};
