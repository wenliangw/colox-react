import type { TooltipTriggerProps } from '../../types';

/**
 * The Tooltip.Trigger declaration: renders nothing itself — the root
 * captures its single child during compilation (utils/leaves) and
 * clones that host in place. The child may be a component or a DOM
 * element: the injection surface (events plus aria describedby) is
 * meaningful on both, and the host keeps its own words.
 */
export const TooltipTrigger = (_props: TooltipTriggerProps) => null;

TooltipTrigger.displayName = 'Tooltip.Trigger';
