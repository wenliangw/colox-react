import { TooltipPanel } from '../../controls/panel';
import { useTooltipContext } from '../../hooks/use-tooltip-context';
import type { TooltipContentProps } from '../../types';

/**
 * The Tooltip.Content carrier: owns its DOM. It reads the root surface
 * through the protected outlet and mounts the portal panel (cdk Popup
 * plus the content box) whenever the tooltip is visible. `className`
 * and `style` are the escape hatch — they land on the content box.
 */
export const TooltipContent = ({ children, className, style }: TooltipContentProps) => {
  const {
    panelRef,
    visible,
    contentId,
    triggerRef,
    placement,
    gap,
    fallbackPlacements,
    showArrow,
    variant,
    size,
  } = useTooltipContext();

  return (
    <TooltipPanel
      ref={panelRef}
      open={visible}
      contentId={contentId}
      referenceRef={triggerRef}
      placement={placement}
      gap={gap}
      fallbackPlacements={fallbackPlacements}
      showArrow={showArrow}
      variant={variant}
      size={size}
      contentClassName={className}
      contentStyle={style}
    >
      {children}
    </TooltipPanel>
  );
};

TooltipContent.displayName = 'Tooltip.Content';
