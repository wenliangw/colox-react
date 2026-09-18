import type { ResolveTextareaSlotsParams, ResolvedTextareaSlots } from '../types';

/**
 * Pure slot resolution for the textarea shell. Discriminations live here so
 * the component body stays orchestration-only — same shape as
 * `resolveInputSlots` for Input.
 */
export const resolveTextareaSlots = ({
  clearable,
  disabled,
  readOnly,
}: ResolveTextareaSlotsParams): ResolvedTextareaSlots => {
  const showClear = clearable && !disabled && !readOnly;

  return { showClear };
};
