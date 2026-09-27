import type { HTMLAttributes } from 'react';

/**
 * The Drawer.Title declaration slot: renders nothing — the root
 * captures its children during compilation and mounts the heading,
 * wiring the panel's `aria-labelledby` to it.
 */
export type DrawerTitleProps = HTMLAttributes<HTMLDivElement>;

/**
 * The Drawer.Content declaration slot: renders nothing — the root
 * captures its children during compilation and mounts the body (the
 * panel scrolls internally when the content outgrows the viewport).
 */
export type DrawerContentProps = HTMLAttributes<HTMLDivElement>;

/**
 * The Drawer.Footer declaration slot: renders nothing — the root
 * captures its children during compilation and mounts the action row.
 */
export type DrawerFooterProps = HTMLAttributes<HTMLDivElement>;
