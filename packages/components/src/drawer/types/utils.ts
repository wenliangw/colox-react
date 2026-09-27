import type { ReactElement } from 'react';
import type { DrawerContentProps, DrawerFooterProps, DrawerTitleProps } from './children';

/** The structural compilation over the drawer children. */
export interface CompiledDrawerLeaves {
  /** The Title declaration — its children become the panel header. */
  title: ReactElement<DrawerTitleProps> | null;
  /** The Content declaration — its children become the panel body. */
  content: ReactElement<DrawerContentProps> | null;
  /** The Footer declaration — its children become the panel footer. */
  footer: ReactElement<DrawerFooterProps> | null;
}
