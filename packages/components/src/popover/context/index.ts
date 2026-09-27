import { createContext } from 'react';
import { POPOVER_GAP } from '../constants/position';
import type { PopoverContextValue } from '../types';

/**
 * The no-op default: a composed part mounted outside any Popover root
 * reads this (isDefault marks it) and renders nothing. Refs are plain
 * `{ current: null }` objects — honest about their emptiness.
 */
export const defaultPopoverContextValue: PopoverContextValue = {
  isDefault: true,
  visible: false,
  panelId: '',
  triggerRef: { current: null },
  panelRef: { current: null },
  title: undefined,
  placement: 'bottom-start',
  gap: POPOVER_GAP.WITH_ARROW,
  fallbackPlacements: ['top'],
  showArrow: true,
  setPanelRef: () => {},
  bridgeHandlers: {},
};

export const PopoverContext = createContext<PopoverContextValue>(defaultPopoverContextValue);
