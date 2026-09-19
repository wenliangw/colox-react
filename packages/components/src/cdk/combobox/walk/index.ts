import { isValidElement } from 'react';
import type { ReactElement, ReactNode } from 'react';

/**
 * The structural leaf walk shared by every combobox-shaped consumer:
 * one traversal descends fragments, arrays and pass-through wrappers
 * (members passed as children stay reachable), while a component that
 * creates members internally is invisible — the member never renders
 * itself, its element props are the data (same boundary as rc-select).
 * The consumer names its own leaves via `isLeaf`, so the kernel stays
 * free of any component's vocabulary.
 */
export function walkComboboxLeaves(
  children: ReactNode,
  isLeaf: (element: ReactElement<unknown>) => boolean,
  onLeaf: (element: ReactElement<unknown>) => void,
): void {
  const visit = (node: ReactNode): void => {
    if (Array.isArray(node)) {
      node.forEach(visit);
      return;
    }
    if (!isValidElement(node)) {
      return;
    }
    if (isLeaf(node)) {
      onLeaf(node);
      return;
    }
    // Pass-through wrappers: their children stay structurally
    // reachable; the wrapper itself is not a leaf.
    visit((node.props as { children?: ReactNode }).children);
  };
  visit(children);
}
