import { cloneElement, forwardRef, useCallback, useId, useMemo } from 'react';
import { TooltipContent } from './children/content';
import { TooltipTrigger } from './children/trigger';
import { TooltipPanel } from './controls/panel';
import { TooltipContext } from './context';
import { useTooltip } from './hooks/use-tooltip';
import type { TooltipContextValue, TooltipProps, TooltipRef } from './types';
import { compileTooltipLeaves } from './utils/leaves';
import { assignTooltipRef } from './utils/refs';
import { resolveTooltipFallbackPlacements } from './utils/resolve-fallback-placements';
import { resolveTooltipGap } from './utils/resolve-gap';
import { resolveTooltipHasContent } from './utils/resolve-has-content';
import { resolveTooltipTriggerSurface } from './utils/resolve-trigger-surface';

import './styles/index.scss';

/**
 * The hint layer, zero container: Tooltip renders no wrapper element —
 * it clones its trigger in place (the authored DOM structure stays
 * untouched) and injects the interaction surfaces plus the
 * aria-describedby wiring. The body comes from the `content` prop or
 * the composed `<Tooltip.Trigger>` + `<Tooltip.Content>` channels;
 * giving both is a compile error, an empty content renders nothing.
 * hover rides delay.in/out (focus instant), click toggles instantly,
 * manual is the controlled `visible` word whose opt-in close channels
 * echo `onVisibleChange(false)` instead of closing.
 */
const TooltipRoot = forwardRef<TooltipRef, TooltipProps>((props, ref) => {
  const {
    content,
    visibleOn = 'hover',
    visible,
    showArrow = true,
    placement = 'top',
    palette = 'gray',
    delay,
    closeOnScroll = false,
    closeOnOutsideClick = true,
    size = 'md',
    children,
    className,
    style,
    onVisibleChange,
    ...rest
  } = props;

  const compiled = useMemo(
    () => compileTooltipLeaves(children, content !== undefined && content !== null),
    [children, content],
  );

  const {
    visible: open,
    triggerRef,
    panelRef,
    handlers,
  } = useTooltip({
    visibleOn,
    visible,
    delay: delay ?? {},
    closeOnScroll,
    closeOnOutsideClick,
    onVisibleChange,
  });

  const contentId = useId();
  const hasContent = resolveTooltipHasContent(compiled, content);

  const setTriggerRef = useCallback(
    (node: HTMLElement | null) => {
      triggerRef.current = node;
      assignTooltipRef(ref, node);
      if (compiled.trigger !== null) {
        assignTooltipRef((compiled.trigger.props as { ref?: unknown }).ref, node);
      }
    },
    [triggerRef, ref, compiled.trigger],
  );

  const fallbackPlacements = useMemo(
    () => resolveTooltipFallbackPlacements(placement),
    [placement],
  );

  const contextValue = useMemo<TooltipContextValue>(
    () => ({
      isDefault: false,
      visible: open,
      contentId,
      triggerRef,
      panelRef,
      placement,
      gap: resolveTooltipGap(showArrow),
      fallbackPlacements,
      showArrow,
      palette,
      size,
    }),
    [
      open,
      contentId,
      triggerRef,
      panelRef,
      placement,
      showArrow,
      fallbackPlacements,
      palette,
      size,
    ],
  );

  if (compiled.trigger === null) {
    return null;
  }

  const trigger = cloneElement(
    compiled.trigger,
    resolveTooltipTriggerSurface({
      trigger: compiled.trigger,
      describedBy: hasContent ? contentId : undefined,
      className,
      style,
      rest,
      setTriggerRef,
      handlers,
    }),
  );

  return (
    <TooltipContext.Provider value={contextValue}>
      {trigger}
      {compiled.composed && compiled.content}
      {content && (
        <TooltipPanel
          ref={panelRef}
          open={open}
          contentId={contentId}
          referenceRef={triggerRef}
          placement={placement}
          gap={resolveTooltipGap(showArrow)}
          fallbackPlacements={fallbackPlacements}
          showArrow={showArrow}
          palette={palette}
          size={size}
        >
          {content}
        </TooltipPanel>
      )}
    </TooltipContext.Provider>
  );
});

TooltipRoot.displayName = 'Tooltip';

/** The Tooltip module: the root plus the composed part slots (composition discipline). */
export const Tooltip = Object.assign(TooltipRoot, {
  Trigger: TooltipTrigger,
  Content: TooltipContent,
});
