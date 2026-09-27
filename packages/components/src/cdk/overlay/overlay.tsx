import { forwardRef, useImperativeHandle, useRef } from 'react';
import { createPortal } from 'react-dom';
import clsx from 'clsx';
import { usePresence } from '../hooks/use-presence';
import type { OverlayProps } from './types';

import './styles/overlay.scss';

/**
 * The headless full-screen overlay carrier: mounts the overlay into
 * document.body (escaping ancestor overflow/stacking) and owns the
 * mount lifecycle through `usePresence`. Everything positional and
 * visual comes from the consumer's classname on the same element —
 * this carrier performs NO positioning math (an overlay has no
 * reference, no flip, no shift; centering or anchoring is the
 * consumer's CSS).
 *
 * Exit channel: `exitDuration > 0` keeps the overlay mounted for that
 * window after `open` flips false — the overlay carries the exiting
 * class so the consumer plays its exit animation — and unmounts when
 * the window ends. Default 0 = immediate unmount.
 */
export const Overlay = forwardRef<HTMLDivElement, OverlayProps>((props, ref) => {
  const { open, exitDuration = 0, className, children, ...rest } = props;

  const overlayRef = useRef<HTMLDivElement>(null);
  useImperativeHandle(ref, () => overlayRef.current as HTMLDivElement);

  const { show, exiting } = usePresence({ open, exitDuration });

  if (!show) {
    return null;
  }
  return createPortal(
    <div
      ref={overlayRef}
      className={clsx('colox-overlay', { 'colox-overlay--exiting': exiting }, className)}
      {...rest}
    >
      {children}
    </div>,
    document.body,
  );
});

Overlay.displayName = 'Overlay';
