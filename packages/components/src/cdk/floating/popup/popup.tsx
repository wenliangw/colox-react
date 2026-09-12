import { forwardRef, useEffect, useState, useImperativeHandle, useRef } from 'react';
import { createPortal } from 'react-dom';
import clsx from 'clsx';
import { useFloatingPosition } from '../hooks/use-floating-position';
import type { PopupProps } from './types';

import './styles/popup.scss';

/**
 * The headless popup carrier: mounts the panel into document.body
 * (escaping ancestor overflow/stacking), hands positioning to the
 * floating-ui wrapper and owns the enter transition. Everything
 * visual comes from the consumer's classname on the same element.
 */
export const Popup = forwardRef<HTMLDivElement, PopupProps>((props, ref) => {
  const { referenceRef, open, placement, gap, padding, matchWidth, className, children, ...rest } =
    props;

  const panelRef = useRef<HTMLDivElement>(null);
  useImperativeHandle(ref, () => panelRef.current as HTMLDivElement);
  const { positioned } = useFloatingPosition({
    referenceRef,
    floatingRef: panelRef,
    open,
    placement,
    gap,
    padding,
    matchWidth,
  });

  // Popup escapes into document.body — evaluating that during render
  // crashes SSR (document is undefined) and desyncs hydration. Render
  // nothing until the client mounts; the open state still flips
  // client-side and mounts the panel through this same branch.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted || !open) {
    return null;
  }
  return createPortal(
    <div
      ref={panelRef}
      className={clsx('colox-popup', positioned && 'colox-popup--positioned', className)}
      {...rest}
    >
      {children}
    </div>,
    document.body,
  );
});

Popup.displayName = 'Popup';
