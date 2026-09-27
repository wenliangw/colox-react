import type { ReactElement } from 'react';
import type { ModalContentProps, ModalFooterProps, ModalTitleProps } from './children';

/** The structural compilation over the modal children. */
export interface CompiledModalLeaves {
  /** The Title declaration — its children become the panel header. */
  title: ReactElement<ModalTitleProps> | null;
  /** The Content declaration — its children become the panel body. */
  content: ReactElement<ModalContentProps> | null;
  /** The Footer declaration — its children become the panel footer. */
  footer: ReactElement<ModalFooterProps> | null;
}
