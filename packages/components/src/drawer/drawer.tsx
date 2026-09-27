import { forwardRef, useCallback, useId, useImperativeHandle, useMemo, useRef } from 'react';
import clsx from 'clsx';
import { IconX } from '@colox/icons';
import { IconButton } from '../icon-button';
import { Backdrop, Overlay, useScrollLock, useTrap } from '@colox/cdk/overlay';
import { DrawerContent } from './children/content';
import { DrawerFooter } from './children/footer';
import { DrawerTitle } from './children/title';
import { DRAWER_EXIT } from './constants/behavior';
import type {
  DrawerProps,
  DrawerRef,
  DrawerContentResolved,
  DrawerFooterResolved,
  DrawerTitleResolved,
} from './types';
import { compileDrawerLeaves } from './utils/leaves';
import { drawerVariants } from './variants';

import './styles/index.scss';

/**
 * The drawer, purely composed: `<Drawer visible>` holds the overlay,
 * the dim backdrop and the edge-anchored panel; the body lives in
 * `<Drawer.Content>` with the optional `<Drawer.Title>` /
 * `<Drawer.Footer>` around it (plain children are a compile error).
 * Controlled only — there is no defaultVisible; the close button,
 * Escape and the mask all speak through `onVisibleChange(false)`.
 *
 * The panel slides in from an edge (`direction`), sized by `size` —
 * the content space: the width for `left`/`right` panels, the height
 * for `top`/`bottom` ones. Positioning is pure CSS (absolute against
 * the fixed overlay) — no floating math, there is no trigger to
 * anchor to. The strict trap keeps the keyboard inside (aria-modal),
 * the initial focus lands on the first focusable element (or the
 * panel), and closing hands the focus back to the element that had it
 * before the drawer opened.
 */
const DrawerRoot = forwardRef<DrawerRef, DrawerProps>((props, ref) => {
  const {
    visible,
    direction = 'right',
    size = 'md',
    width,
    height,
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

  const compiled = useMemo(() => compileDrawerLeaves(children), [children]);
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

  const resolvedTitle = useMemo<DrawerTitleResolved | undefined>(() => {
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

  const resolvedFooter = useMemo<DrawerFooterResolved | undefined>(() => {
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

  const resolvedContent = useMemo<DrawerContentResolved | undefined>(() => {
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

  // `size` is the content space — the main-axis dimension, decided by
  // the direction: the width for vertical panels (left/right), the
  // height for horizontal ones (top/bottom). The matching escape
  // hatch (`width` for vertical, `height` for horizontal) overrides
  // the tier inline.
  const isVertical = direction === 'left' || direction === 'right';
  const panelStyle = useMemo(() => {
    const hatch = isVertical ? width : height;
    return hatch !== undefined
      ? { ...style, ...(isVertical ? { width: hatch } : { height: hatch }) }
      : style;
  }, [style, isVertical, width, height]);

  return (
    <Overlay open={visible} exitDuration={DRAWER_EXIT} className="colox-drawer">
      {showMask && <Backdrop onClick={closeOnMaskClick ? close : undefined} />}
      <div
        ref={setRootRef}
        role="dialog"
        tabIndex={-1}
        aria-labelledby={resolvedTitle ? titleId : undefined}
        style={panelStyle}
        className={clsx(drawerVariants({ direction, size }), className)}
        {...rest}
      >
        {resolvedTitle && (
          <div
            id={titleId}
            className={clsx('colox-drawer__title', resolvedTitle.className)}
            style={resolvedTitle.style}
          >
            {resolvedTitle.node}
          </div>
        )}
        <div
          className={clsx('colox-drawer__body', resolvedContent?.className)}
          style={resolvedContent?.style}
        >
          {resolvedContent?.node}
        </div>
        {resolvedFooter && (
          <div
            className={clsx('colox-drawer__footer', resolvedFooter.className)}
            style={resolvedFooter.style}
          >
            {resolvedFooter.node}
          </div>
        )}
        {showClose && (
          <IconButton
            size="4"
            variant="muted"
            className="colox-drawer__close"
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

DrawerRoot.displayName = 'Drawer';

export const Drawer = Object.assign(DrawerRoot, {
  Title: DrawerTitle,
  Content: DrawerContent,
  Footer: DrawerFooter,
});

export type DrawerComponent = typeof DrawerRoot & {
  Title: typeof DrawerTitle;
  Content: typeof DrawerContent;
  Footer: typeof DrawerFooter;
};
