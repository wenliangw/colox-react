import type { HTMLAttributes, ReactNode } from 'react';
import type { InitialFocusTarget } from '@colox/cdk/hooks';
import type { ModalVariants } from '../variants';

export type ModalSize = NonNullable<ModalVariants['size']>;

export interface ModalProps extends HTMLAttributes<HTMLDivElement> {
  /** Whether the modal is open. Controlled — there is no defaultVisible. */
  visible: boolean;
  /**
   * The width tier: sm / md / lg map to the design language's
   * `large_size` WIDTH_HEIGHT tokens (112=448px / 160=640px /
   * 192=768px) — semantic tiers, real token values, no invented
   * numbers. @default 'md'
   */
  size?: ModalSize;
  /**
   * The width escape hatch: an explicit width overrides the size tier
   * (a number is treated as px). @default undefined
   */
  width?: number | string;
  /**
   * Whether the dim backdrop renders. @default true
   */
  showMask?: boolean;
  /**
   * Whether a pointerdown on the backdrop closes the modal.
   * @default true
   */
  closeOnMaskClick?: boolean;
  /**
   * Whether the corner close button renders. @default true
   */
  showClose?: boolean;
  /**
   * Where the keyboard focus lands when the modal opens: the first
   * focusable element or the panel itself. @default 'first'
   */
  initialFocus?: InitialFocusTarget;
  /** The single close channel: the close button, Escape and the mask all call it with false. */
  onVisibleChange?: (visible: boolean) => void;
}

export interface ModalRef {
  /** The panel DOM node (the trap root). */
  panel: HTMLDivElement | null;
}

export interface ModalTitleResolved {
  /** The title region content (the Modal.Title children). */
  node: ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export interface ModalFooterResolved {
  /** The footer region content (the Modal.Footer children). */
  node: ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export interface ModalContentResolved {
  /** The body region content (the Modal.Content children). */
  node: ReactNode;
  className?: string;
  style?: React.CSSProperties;
}
