import { isValidElement } from 'react';
import type { ReactElement, ReactNode } from 'react';
import { ModalContent } from '../children/content';
import { ModalFooter } from '../children/footer';
import { ModalTitle } from '../children/title';
import type {
  CompiledModalLeaves,
  ModalContentProps,
  ModalFooterProps,
  ModalTitleProps,
} from '../types';

/**
 * The structural compilation over the modal children: exactly the
 * three declaration parts, each at most once. Plain (non-part)
 * children are a hard error — the modal is purely composed, so the
 * body must live in <Modal.Content> (an implicit body would be a
 * second source for the same region). Fragments stay transparent.
 */
export function compileModalLeaves(children: ReactNode): CompiledModalLeaves {
  let title: ReactElement<ModalTitleProps> | null = null;
  let content: ReactElement<ModalContentProps> | null = null;
  let footer: ReactElement<ModalFooterProps> | null = null;

  const visit = (node: ReactNode): void => {
    if (Array.isArray(node)) {
      node.forEach(visit);
      return;
    }
    if (!isValidElement(node)) {
      // A bare string/number child is not a part — the pure composed
      // form has no implicit body slot.
      throw new Error(
        'Modal accepts only <Modal.Title>, <Modal.Content> and <Modal.Footer> children — put the body in <Modal.Content>.',
      );
    }
    if (node.type === ModalTitle) {
      if (title !== null) {
        throw new Error('Modal accepts at most one <Modal.Title>.');
      }
      title = node as ReactElement<ModalTitleProps>;
      return;
    }
    if (node.type === ModalContent) {
      if (content !== null) {
        throw new Error('Modal accepts at most one <Modal.Content>.');
      }
      content = node as ReactElement<ModalContentProps>;
      return;
    }
    if (node.type === ModalFooter) {
      if (footer !== null) {
        throw new Error('Modal accepts at most one <Modal.Footer>.');
      }
      footer = node as ReactElement<ModalFooterProps>;
      return;
    }
    throw new Error(
      'Modal accepts only <Modal.Title>, <Modal.Content> and <Modal.Footer> children — put the body in <Modal.Content>.',
    );
  };

  visit(children);

  return { title, content, footer };
}
