import { isValidElement } from 'react';
import type { ReactElement, ReactNode } from 'react';
import { DrawerContent } from '../children/content';
import { DrawerFooter } from '../children/footer';
import { DrawerTitle } from '../children/title';
import type {
  CompiledDrawerLeaves,
  DrawerContentProps,
  DrawerFooterProps,
  DrawerTitleProps,
} from '../types';

/**
 * The structural compilation over the drawer children: exactly the
 * three declaration parts, each at most once. Plain (non-part)
 * children are a hard error — the drawer is purely composed, so the
 * body must live in <Drawer.Content> (an implicit body would be a
 * second source for the same region). Fragments stay transparent.
 */
export function compileDrawerLeaves(children: ReactNode): CompiledDrawerLeaves {
  let title: ReactElement<DrawerTitleProps> | null = null;
  let content: ReactElement<DrawerContentProps> | null = null;
  let footer: ReactElement<DrawerFooterProps> | null = null;

  const visit = (node: ReactNode): void => {
    if (Array.isArray(node)) {
      node.forEach(visit);
      return;
    }
    if (!isValidElement(node)) {
      // A bare string/number child is not a part — the pure composed
      // form has no implicit body slot.
      throw new Error(
        'Drawer accepts only <Drawer.Title>, <Drawer.Content> and <Drawer.Footer> children — put the body in <Drawer.Content>.',
      );
    }
    if (node.type === DrawerTitle) {
      if (title !== null) {
        throw new Error('Drawer accepts at most one <Drawer.Title>.');
      }
      title = node as ReactElement<DrawerTitleProps>;
      return;
    }
    if (node.type === DrawerContent) {
      if (content !== null) {
        throw new Error('Drawer accepts at most one <Drawer.Content>.');
      }
      content = node as ReactElement<DrawerContentProps>;
      return;
    }
    if (node.type === DrawerFooter) {
      if (footer !== null) {
        throw new Error('Drawer accepts at most one <Drawer.Footer>.');
      }
      footer = node as ReactElement<DrawerFooterProps>;
      return;
    }
    throw new Error(
      'Drawer accepts only <Drawer.Title>, <Drawer.Content> and <Drawer.Footer> children — put the body in <Drawer.Content>.',
    );
  };

  visit(children);

  return { title, content, footer };
}
