import { cloneElement, forwardRef, useCallback, useId, useMemo } from 'react';
import { PopoverContent } from './children/content';
import { PopoverTitle } from './children/title';
import { PopoverTrigger } from './children/trigger';
import { PopoverPanel } from './controls/panel';
import { PopoverContext } from './context';
import { usePopover } from './hooks/use-popover';
import type { PopoverContextValue, PopoverProps, PopoverRef, PopoverTitleResolved } from './types';
import { compilePopoverLeaves } from './utils/leaves';
import { assignPopoverRef } from './utils/refs';
import { resolvePopoverFallbackPlacements } from './utils/resolve-fallback-placements';
import { resolvePopoverGap } from './utils/resolve-gap';
import { resolvePopoverHasContent } from './utils/resolve-has-content';
import { resolvePopoverTriggerSurface } from './utils/resolve-trigger-surface';

import './styles/index.scss';

/**
 * The interactive floating card, zero container: Popover renders no
 * wrapper element — it clones its trigger in place (the authored DOM
 * structure stays untouched) and injects the interaction surfaces
 * plus the dialog aria wiring (haspopup/expanded/controls). The
 * header and the body come from the `title`/`content` props or the
 * composed `<Popover.Trigger>` + `<Popover.Title>` + `<Popover.Content>`
 * channels; giving a word in both channels is a compile error, an
 * empty content renders nothing. click toggles instantly and focuses
 * the panel, hover rides the delay pair (the out-delay doubles as the
 * pointer bridge into the panel) and never steals focus, manual is
 * the controlled `visible` word.
 */
const PopoverRoot = forwardRef<PopoverRef, PopoverProps>((props, ref) => {
  const {
    title,
    content,
    visibleOn = 'click',
    visible,
    showArrow = true,
    placement = 'bottom-start',
    delay,
    closeOnScroll = false,
    closeOnOutsideClick = true,
    children,
    className,
    style,
    onVisibleChange,
    ...rest
  } = props;

  const compiled = useMemo(
    () =>
      compilePopoverLeaves(
        children,
        content !== undefined && content !== null,
        title !== undefined && title !== null,
      ),
    [children, content, title],
  );

  const panelId = useId();
  const hasContent = resolvePopoverHasContent(compiled, content);

  const {
    visible: open,
    triggerRef,
    panelRef,
    handlers,
    bridgeHandlers,
    setPanelRef,
  } = usePopover({
    visibleOn,
    visible,
    delay: delay ?? {},
    closeOnScroll,
    closeOnOutsideClick,
    onVisibleChange,
    hasContent,
  });

  const compiledTitle = useMemo<PopoverTitleResolved | undefined>(() => {
    if (compiled.title !== null) {
      const titleProps = compiled.title.props;
      return {
        node: titleProps.children,
        className: titleProps.className,
        style: titleProps.style,
      };
    }
    if (title !== undefined && title !== null && title !== '') {
      return { node: title };
    }
    return undefined;
  }, [compiled.title, title]);

  const setTriggerRef = useCallback(
    (node: HTMLElement | null) => {
      triggerRef.current = node;
      assignPopoverRef(ref, node);
      if (compiled.trigger !== null) {
        assignPopoverRef((compiled.trigger.props as { ref?: unknown }).ref, node);
      }
    },
    [triggerRef, ref, compiled.trigger],
  );

  const fallbackPlacements = useMemo(
    () => resolvePopoverFallbackPlacements(placement),
    [placement],
  );

  const contextValue = useMemo<PopoverContextValue>(
    () => ({
      isDefault: false,
      visible: open,
      panelId,
      triggerRef,
      panelRef,
      setPanelRef,
      title: compiledTitle,
      placement,
      gap: resolvePopoverGap(showArrow),
      fallbackPlacements,
      showArrow,
      bridgeHandlers,
    }),
    [
      open,
      panelId,
      triggerRef,
      panelRef,
      setPanelRef,
      compiledTitle,
      placement,
      showArrow,
      fallbackPlacements,
      bridgeHandlers,
    ],
  );

  if (compiled.trigger === null) {
    return null;
  }

  const trigger = cloneElement(
    compiled.trigger,
    resolvePopoverTriggerSurface({
      trigger: compiled.trigger,
      setTriggerRef,
      panelId,
      visible: open && hasContent,
      handlers,
      className,
      style,
      rest: rest as Record<string, unknown>,
    }),
  );

  const panelProps = {
    open,
    panelId,
    referenceRef: triggerRef,
    placement,
    gap: resolvePopoverGap(showArrow),
    fallbackPlacements,
    showArrow,
    title: compiledTitle,
    bridgeHandlers,
  };

  return (
    <PopoverContext.Provider value={contextValue}>
      {trigger}
      {compiled.composed && compiled.content}
      {hasContent && !compiled.composed && (
        <PopoverPanel ref={setPanelRef} {...panelProps}>
          {content}
        </PopoverPanel>
      )}
    </PopoverContext.Provider>
  );
});

PopoverRoot.displayName = 'Popover';

/** The Popover module: the root plus the composed part slots (composition discipline). */
export const Popover = Object.assign(PopoverRoot, {
  Trigger: PopoverTrigger,
  Title: PopoverTitle,
  Content: PopoverContent,
});
