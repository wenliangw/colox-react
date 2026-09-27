import { forwardRef, useEffect, useState, useImperativeHandle, useRef } from 'react';
import { createPortal } from 'react-dom';
import clsx from 'clsx';
import { useFloatingPosition } from '../hooks/use-floating-position';
import type { PopupProps } from '../types';

import './styles/popup.scss';

/**
 * The headless popup carrier: mounts the panel into document.body
 * (escaping ancestor overflow/stacking), hands positioning to the
 * floating-ui wrapper and owns the enter transition. Everything
 * visual comes from the consumer's classname on the same element.
 *
 * Exit channel: `exitDuration > 0` keeps the panel mounted for that
 * window after `open` flips false — the panel carries the exiting
 * class so the consumer plays its exit animation — and un-mounts
 * when the window ends. Default 0 = immediate unmount (unchanged
 * for every existing consumer).
 */
export const Popup = forwardRef<HTMLDivElement, PopupProps>((props, ref) => {
  const {
    referenceRef,
    open,
    fallbackPlacements,
    placement,
    gap,
    padding,
    matchWidth,
    exitDuration = 0,
    className,
    children,
    ...rest
  } = props;

  const panelRef = useRef<HTMLDivElement>(null);
  useImperativeHandle(ref, () => panelRef.current as HTMLDivElement);

  // Popup escapes into document.body — evaluating that during render
  // crashes SSR (document is undefined) and desyncs hydration, so
  // `presence` (false server-side and until the first client tick)
  // gates the portal. The open/exit clock rides the same state: open
  // mounts the panel; an open->false edge with an exit window keeps
  // it for that long and unmounts at the end, without one re-opens
  // instantly.
  const [presence, setPresence] = useState(false);

  useEffect(() => {
    if (open) {
      setPresence(true);
      return undefined;
    }
    if (exitDuration === 0) {
      setPresence(false);
      return undefined;
    }
    const timer = window.setTimeout(() => setPresence(false), exitDuration);
    return () => window.clearTimeout(timer);
  }, [open, exitDuration]);

  // The panel time on screen, exit-aware: `open` mounts it, an exit
  // window keeps it alive after the close edge, and a zero window
  // unmounts in the SAME commit as the close (an instant-unmount
  // consumer never sees an extra painted frame). SSR stays safe:
  // `presence` is false server-side, so nothing portals or positions.
  const show = presence && (exitDuration > 0 || open);
  const exiting = show && !open;

  const { positioned } = useFloatingPosition({
    referenceRef,
    floatingRef: panelRef,
    // The pre-mount gate: `show` keeps the pointing stream on the
    // false->true edge for a panel that mounts ALREADY open (the
    // portal element arrives a tick later) and keeps the exiting
    // panel on the stream for its whole window, so the fade-out
    // plays anchored where it was painted, not at 0,0.
    open: show,
    fallbackPlacements,
    placement,
    gap,
    padding,
    matchWidth,
  });

  if (!show) {
    return null;
  }
  return createPortal(
    <div
      ref={panelRef}
      className={clsx(
        'colox-popup',
        positioned && 'colox-popup--positioned',
        exiting && 'colox-popup--exiting',
        className,
      )}
      {...rest}
    >
      {children}
    </div>,
    document.body,
  );
});

Popup.displayName = 'Popup';
