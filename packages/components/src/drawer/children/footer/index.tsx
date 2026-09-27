import type { DrawerFooterProps } from '../../types';

/**
 * The Drawer.Footer declaration: renders nothing itself — the parent
 * Drawer extracts its children into the panel's footer region, with
 * the part's className/style landing on the footer element.
 */
export const DrawerFooter = (_props: DrawerFooterProps) => null;

DrawerFooter.displayName = 'Drawer.Footer';
