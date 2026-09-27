import { createContext } from 'react';
import { TOOLTIP_GAP } from '../constants/position';
import type { TooltipContextValue } from '../types';

/**
 * The no-op default: a composed part mounted outside any Tooltip root
 * reads this (isDefault marks it) and renders nothing. Refs are plain
 * `{ current: null }` objects — honest about their emptiness.
 */
export const defaultTooltipContextValue: TooltipContextValue = {
  isDefault: true,
  visible: false,
  contentId: '',
  triggerRef: { current: null },
  panelRef: { current: null },
  placement: 'top',
  gap: TOOLTIP_GAP.WITH_ARROW,
  fallbackPlacements: ['bottom'],
  showArrow: true,
  palette: 'gray',
  size: 'md',
};

export const TooltipContext = createContext<TooltipContextValue>(defaultTooltipContextValue);
