import { forwardRef } from 'react';
import clsx from 'clsx';
import { Popup } from '@colox/cdk/floating';
import type { TooltipPanelProps } from '../types';
import { tooltipVariants } from '../variants';

/**
 * The portal panel unit the two channels share: the cdk Popup carries
 * the portal and the positioning (fixed, autoUpdate follow, flipping
 * through the tooltip's opposite-side chain) and writes the resolved
 * placement as `data-placement` — the arrow and the directional
 * shadow pin to that word. The inner content box paints the surfaces
 * (palette/size/arrow); the panel root stays click-through, a hint
 * never blocks its trigger.
 */
export const TooltipPanel = forwardRef<HTMLDivElement, TooltipPanelProps>(
  (
    {
      open,
      contentId,
      referenceRef,
      placement,
      gap,
      fallbackPlacements,
      showArrow,
      palette,
      size,
      contentClassName,
      contentStyle,
      children,
    },
    ref,
  ) => (
    <Popup
      ref={ref}
      id={contentId}
      role="tooltip"
      referenceRef={referenceRef}
      open={open}
      placement={placement}
      gap={gap}
      matchWidth={false}
      fallbackPlacements={fallbackPlacements}
      className={clsx(
        'colox-tooltip__panel',
        palette !== 'gray' && `colox-tooltip__panel--${palette}`,
      )}
    >
      {/* The arrow renders BEFORE the content: the rotated diamond buries
          its inner half under the content box (painted after), so only
          the outer triangle shows without any clip-path. */}
      {showArrow ? (
        <span
          aria-hidden="true"
          className={clsx('colox-tooltip__arrow', size === 'sm' && 'colox-tooltip__arrow--size-sm')}
        />
      ) : null}
      <div
        className={clsx(tooltipVariants({ palette, size, arrow: showArrow }), contentClassName)}
        style={contentStyle}
      >
        {children}
      </div>
    </Popup>
  ),
);

TooltipPanel.displayName = 'TooltipPanel';
