import type { PopoverTitleProps } from '../../types';

/**
 * The Popover.Title declaration: renders nothing itself — the root
 * captures its children during compilation (utils/leaves) and mounts
 * the header row inside the panel (above the content box). Its
 * `className`/`style` land on the header element.
 */
export const PopoverTitle = (_props: PopoverTitleProps) => null;

PopoverTitle.displayName = 'Popover.Title';
