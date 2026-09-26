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
 * manual is the controlled `visible` word.
 */
const TooltipRoot = forwardRef<TooltipRef, TooltipProps>((props, ref) => {
  const {
    content,
    visibleOn = 'hover',
    visible,
    showArrow = true,
    placement = 'top',
    variant = 'dark',
    delay,
    closeOnScroll = false,
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
    onVisibleChange,
  });

  const contentId = useId();
  const hasContent = compiled.composed ? compiled.content !== null : Boolean(content);

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
      gap: showArrow ? 6 : 4,
      fallbackPlacements,
      showArrow,
      variant,
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
      variant,
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
      setTriggerRef,
      describedBy: hasContent ? contentId : undefined,
      handlers,
      className,
      style,
      rest,
    }),
  );

  return (
    <TooltipContext.Provider value={contextValue}>
      {trigger}
      {compiled.composed ? (
        compiled.content
      ) : content ? (
        <TooltipPanel
          ref={panelRef}
          open={open}
          contentId={contentId}
          referenceRef={triggerRef}
          placement={placement}
          gap={showArrow ? 6 : 4}
          fallbackPlacements={fallbackPlacements}
          showArrow={showArrow}
          variant={variant}
          size={size}
        >
          {content}
        </TooltipPanel>
      ) : null}
    </TooltipContext.Provider>
  );
});

TooltipRoot.displayName = 'Tooltip';

/** The Tooltip module: the root plus the composed part slots (composition discipline). */
export const Tooltip = Object.assign(TooltipRoot, {
  Trigger: TooltipTrigger,
  Content: TooltipContent,
});
