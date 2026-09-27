import { PopoverPanel } from '../../controls/panel';
import { usePopoverContext } from '../../hooks/use-popover-context';
import type { PopoverContentProps } from '../../types';

/**
 * The Popover.Content carrier: owns its panel DOM. It reads the root
 * surface through the protected outlet and mounts the portal panel
 * (cdk Popup plus the content box, under the optional header) whenever
 * the popover is visible. `className` and `style` are the escape
 * hatch — they land on the content box.
 */
export const PopoverContent = ({ children, className, style }: PopoverContentProps) => {
  const {
    visible,
    panelId,
    triggerRef,
    setPanelRef,
    title,
    placement,
    gap,
    fallbackPlacements,
    showArrow,
    bridgeHandlers,
  } = usePopoverContext();

  return (
    <PopoverPanel
      ref={setPanelRef}
      open={visible}
      panelId={panelId}
      referenceRef={triggerRef}
      placement={placement}
      gap={gap}
      fallbackPlacements={fallbackPlacements}
      showArrow={showArrow}
      title={title}
      bridgeHandlers={bridgeHandlers}
      contentClassName={className}
      contentStyle={style}
    >
      {children}
    </PopoverPanel>
  );
};

PopoverContent.displayName = 'Popover.Content';
