import { forwardRef, useId } from 'react';
import clsx from 'clsx';
import { Popup } from '@colox/cdk/floating';
import { POPOVER_EXIT } from '../constants/behavior';
import type { PopoverPanelProps } from '../types';
import { popoverVariants } from '../variants';

/**
 * The portal panel unit the two channels share: the cdk Popup carries
 * the portal and positioning (fixed, autoUpdate follow, flipping
 * through the opposite-side chain) and writes the resolved placement
 * as `data-placement` — the arrow and the directional shadow pin to
 * that word. The panel is a REAL interactive surface (a non-modal
 * dialog: role + tabindex=-1 so the focus machine can land on it when
 * the content holds no focusable element); the arrow renders BEFORE
 * the content (the rotated diamond buries its inner half under the
 * boxes painted after it — no clip-path), then the optional title row
 * over the content box. The exit window (POPOVER_EXIT) keeps the
 * panel mounted through the fade-out. The bridge handlers ride the
 * panel root: the hover region spans the trigger AND the panel.
 */
export const PopoverPanel = forwardRef<HTMLDivElement, PopoverPanelProps>(
  (
    {
      open,
      panelId,
      referenceRef,
      placement,
      gap,
      fallbackPlacements,
      showArrow,
      title,
      contentClassName,
      contentStyle,
      children,
      bridgeHandlers,
    },
    ref,
  ) => {
    const titleId = useId();

    return (
      <Popup
        ref={ref}
        id={panelId}
        role="dialog"
        tabIndex={-1}
        referenceRef={referenceRef}
        open={open}
        placement={placement}
        gap={gap}
        matchWidth={false}
        fallbackPlacements={fallbackPlacements}
        exitDuration={POPOVER_EXIT}
        aria-labelledby={title ? titleId : undefined}
        className={popoverVariants({ arrow: showArrow })}
        {...bridgeHandlers}
      >
        {showArrow && <span aria-hidden="true" className="colox-popover__arrow" />}
        {title && (
          <div
            id={titleId}
            className={clsx('colox-popover__title', title.className)}
            style={title.style}
          >
            {title.node}
          </div>
        )}
        <div className={clsx('colox-popover__content', contentClassName)} style={contentStyle}>
          {children}
        </div>
      </Popup>
    );
  },
);

PopoverPanel.displayName = 'PopoverPanel';
