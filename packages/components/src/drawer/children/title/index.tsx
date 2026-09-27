import type { DrawerTitleProps } from '../../types';

/**
 * The Drawer.Title declaration: renders nothing itself — the parent
 * Drawer extracts its children into the panel's header region, with
 * the part's className/style landing on the title element.
 */
export const DrawerTitle = (_props: DrawerTitleProps) => null;

DrawerTitle.displayName = 'Drawer.Title';
