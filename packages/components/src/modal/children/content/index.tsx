import type { ModalContentProps } from '../../types';

/**
 * The Modal.Content declaration: renders nothing itself — the parent
 * Modal extracts its children into the panel's body region, with the
 * part's className/style landing on the body element.
 */
export const ModalContent = (_props: ModalContentProps) => null;

ModalContent.displayName = 'Modal.Content';
