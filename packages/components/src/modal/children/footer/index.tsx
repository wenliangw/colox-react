import type { ModalFooterProps } from '../../types';

/**
 * The Modal.Footer declaration: renders nothing itself — the parent
 * Modal extracts its children into the panel's footer region, with the
 * part's className/style landing on the footer element.
 */
export const ModalFooter = (_props: ModalFooterProps) => null;

ModalFooter.displayName = 'Modal.Footer';
