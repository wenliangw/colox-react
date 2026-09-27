import type { DrawerContentProps } from '../../types';

/**
 * The Drawer.Content declaration: renders nothing itself — the parent
 * Drawer extracts its children into the panel's body region, with the
 * part's className/style landing on the body element.
 */
export const DrawerContent = (_props: DrawerContentProps) => null;

DrawerContent.displayName = 'Drawer.Content';
