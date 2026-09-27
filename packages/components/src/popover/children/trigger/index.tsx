import type { PopoverTriggerProps } from '../../types';

/**
 * The Popover.Trigger declaration: renders nothing itself — the root
 * captures its single child during compilation (utils/leaves) and
 * clones that host in place. The child may be a component or a DOM
 * element: the injection surface (events plus the dialog aria wiring)
 * is meaningful on both, and the host keeps its own words.
 */
export const PopoverTrigger = (_props: PopoverTriggerProps) => null;

PopoverTrigger.displayName = 'Popover.Trigger';
