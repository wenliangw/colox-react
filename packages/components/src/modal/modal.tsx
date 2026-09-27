import { forwardRef, useCallback, useId, useImperativeHandle, useMemo, useRef } from 'react';
import clsx from 'clsx';
import { IconX } from '@colox/icons';
import { IconButton } from '../icon-button';
import { Backdrop, Overlay, useScrollLock, useTrap } from '@colox/cdk/overlay';
import { ModalContent } from './children/content';
import { ModalFooter } from './children/footer';
import { ModalTitle } from './children/title';
import { MODAL_EXIT } from './constants/behavior';
import type {
  ModalProps,
  ModalRef,
  ModalContentResolved,
  ModalFooterResolved,
  ModalTitleResolved,
} from './types';
import { compileModalLeaves } from './utils/leaves';
import { modalVariants } from './variants';

import './styles/index.scss';

/**
 * The modal dialog, purely composed: `<Modal visible>` holds the
 * overlay, the dim backdrop and the centered panel; the body lives in
 * `<Modal.Content>` with the optional `<Modal.Title>` / `<Modal.Footer>`
 * around it (plain children are a compile error). Controlled only —
 * there is no defaultVisible; the close button, Escape and the mask
 * all speak through `onVisibleChange(false)`.
 *
 * Positioning is pure CSS (the overlay centers the panel via flex) —
 * no floating math, there is no trigger to anchor to. The strict trap
 * keeps the keyboard inside (aria-modal), the initial focus lands on
 * the first focusable element (or the panel), and closing hands the
 * focus back to the element that had it before the modal opened.
 */
const ModalRoot = forwardRef<ModalRef, ModalProps>((props, ref) => {
  const {
    visible,
    size = 'md',
    width,
    showMask = true,
    closeOnMaskClick = true,
    showClose = true,
    initialFocus = 'first',
    className,
    style,
    children,
    onVisibleChange,
    ...rest
  } = props;

  const compiled = useMemo(() => compileModalLeaves(children), [children]);
  const titleId = useId();

  const panelRef = useRef<HTMLDivElement>(null);
  useImperativeHandle(ref, () => ({ panel: panelRef.current }));

  const close = useCallback(() => {
    onVisibleChange?.(false);
  }, [onVisibleChange]);

  const { setRootRef } = useTrap({
    rootRef: panelRef,
    enabled: visible,
    ariaModal: true,
    initialFocus,
    restoreFocus: true,
    onEscape: close,
  });

  useScrollLock(visible);

  const resolvedTitle = useMemo<ModalTitleResolved | undefined>(() => {
    if (compiled.title !== null) {
      const titleProps = compiled.title.props;
      return {
        node: titleProps.children,
        className: titleProps.className,
        style: titleProps.style,
      };
    }
    return undefined;
  }, [compiled.title]);

  const resolvedFooter = useMemo<ModalFooterResolved | undefined>(() => {
    if (compiled.footer !== null) {
      const footerProps = compiled.footer.props;
      return {
        node: footerProps.children,
        className: footerProps.className,
        style: footerProps.style,
      };
    }
    return undefined;
  }, [compiled.footer]);

  const resolvedContent = useMemo<ModalContentResolved | undefined>(() => {
    if (compiled.content !== null) {
      const contentProps = compiled.content.props;
      return {
        node: contentProps.children,
        className: contentProps.className,
        style: contentProps.style,
      };
    }
    return undefined;
  }, [compiled.content]);

  const panelStyle = useMemo(
    () => (width !== undefined ? { ...style, width } : style),
    [width, style],
  );

  return (
    <Overlay open={visible} exitDuration={MODAL_EXIT} className="colox-modal">
      {showMask && <Backdrop onClick={closeOnMaskClick ? close : undefined} />}
      <div
        ref={setRootRef}
        role="dialog"
        tabIndex={-1}
        aria-labelledby={resolvedTitle ? titleId : undefined}
        style={panelStyle}
        className={clsx(modalVariants({ size }), className)}
        {...rest}
      >
        {resolvedTitle && (
          <div
            id={titleId}
            className={clsx('colox-modal__title', resolvedTitle.className)}
            style={resolvedTitle.style}
          >
            {resolvedTitle.node}
          </div>
        )}
        <div
          className={clsx('colox-modal__body', resolvedContent?.className)}
          style={resolvedContent?.style}
        >
          {resolvedContent?.node}
        </div>
        {resolvedFooter && (
          <div
            className={clsx('colox-modal__footer', resolvedFooter.className)}
            style={resolvedFooter.style}
          >
            {resolvedFooter.node}
          </div>
        )}
        {showClose && (
          <IconButton
            size="4"
            variant="muted"
            className="colox-modal__close"
            aria-label="Close"
            onClick={close}
          >
            <IconX aria-hidden="true" />
          </IconButton>
        )}
      </div>
    </Overlay>
  );
});

ModalRoot.displayName = 'Modal';

export const Modal = Object.assign(ModalRoot, {
  Title: ModalTitle,
  Content: ModalContent,
  Footer: ModalFooter,
});

export type ModalComponent = typeof ModalRoot & {
  Title: typeof ModalTitle;
  Content: typeof ModalContent;
  Footer: typeof ModalFooter;
};
