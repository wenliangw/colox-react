import type { ModalTitleProps } from '../../types';

/**
 * The Modal.Title declaration: renders nothing itself — the parent
 * Modal extracts its children into the panel's header region, with the
 * part's className/style landing on the title element.
 */
export const ModalTitle = (_props: ModalTitleProps) => null;

ModalTitle.displayName = 'Modal.Title';
