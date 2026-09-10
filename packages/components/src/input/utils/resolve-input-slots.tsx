import type { InputHTMLAttributes, ReactNode } from 'react';
import { IconSearch } from '@colox/icons';

interface ResolveInputSlotsParams {
  type: InputHTMLAttributes<HTMLInputElement>['type'];
  leading: ReactNode;
  trailing: ReactNode;
  clearable: boolean;
  /** Native flags arrive optional — falsy means "not set". */
  disabled?: boolean;
  readOnly?: boolean;
  /** Whether the password visibility toggle is active (`allowTogglePassword`
   *  and type `password`). */
  toggleActive: boolean;
}

export interface ResolvedInputSlots {
  /** The leading slot content — the automatic search icon fills in for a
   *  `type="search"` input without an explicit `leading`. */
  searchLeading: ReactNode;
  /** The clear button hides with disabled/readOnly (nothing to clear). */
  showClear: boolean;
  /** The trailing slot renders only when it has something to show: the
   *  consumer's trailing content or a built-in control. */
  showTrailing: boolean;
}

/**
 * Pure slot resolution for the input shell: which slots exist and what
 * they contain. Discriminations live here so the component body stays
 * orchestration-only.
 */
export const resolveInputSlots = ({
  type,
  leading,
  trailing,
  clearable,
  disabled,
  readOnly,
  toggleActive,
}: ResolveInputSlotsParams): ResolvedInputSlots => {
  const searchLeading = type === 'search' ? (leading ?? <IconSearch />) : leading;
  const showClear = clearable && !disabled && !readOnly;
  const showTrailing = trailing !== undefined || showClear || toggleActive;

  return { searchLeading, showClear, showTrailing };
};
