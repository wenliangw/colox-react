import type { HTMLAttributes } from 'react';

/**
 * The Modal.Title declaration slot: renders nothing — the root
 * captures its children during compilation and mounts the heading,
 * wiring the panel's `aria-labelledby` to it.
 */
export type ModalTitleProps = HTMLAttributes<HTMLDivElement>;

/**
 * The Modal.Content declaration slot: renders nothing — the root
 * captures its children during compilation and mounts the body (the
 * panel scrolls internally when the content outgrows the viewport).
 */
export type ModalContentProps = HTMLAttributes<HTMLDivElement>;

/**
 * The Modal.Footer declaration slot: renders nothing — the root
 * captures its children during compilation and mounts the action row.
 */
export type ModalFooterProps = HTMLAttributes<HTMLDivElement>;
