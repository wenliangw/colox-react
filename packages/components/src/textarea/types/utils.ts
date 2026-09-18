import type { TextareaAutosize } from './component';

export interface TextareaMetrics {
  /**
   * Computed line-height in px (styles not applied yet → undefined and the
   * row-bound clamping degrades to unclamped).
   */
  lineHeight: number | undefined;
  paddingBlock: number;
  borderBlock: number;
  /**
   * The global reset is border-box: scrollHeight includes padding but not
   * border, so the target box height adds the border only.
   */
  borderBox: boolean;
}

export interface ResolveTextareaAutosizeParams {
  autoSize: TextareaAutosize | boolean | undefined;
}

export interface ResolvedTextareaAutosize {
  active: boolean;
  minRows: number | undefined;
  maxRows: number | undefined;
  /**
   * Whether the footer drag handle is enabled: unbounded growth worlds
   * only (default / `true` / `{ minRows }`). Capped (`{ maxRows }`) and
   * off (`false`) worlds render no handle.
   */
  resizable: boolean;
}

export interface ResolveTextareaSlotsParams {
  clearable: boolean;
  /**
   * Native flags arrive optional — falsy means "not set".
   */
  disabled?: boolean;
  readOnly?: boolean;
}

export interface ResolvedTextareaSlots {
  /**
   * The clear button hides with disabled/readOnly (nothing to clear).
   */
  showClear: boolean;
}
