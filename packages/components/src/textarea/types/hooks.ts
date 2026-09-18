import type { ChangeEventHandler, RefObject } from 'react';
import type { ResolvedTextareaAutosize } from './utils';

/**
 * The value union the native textarea accepts (UTF-16 semantics).
 */
export type TextareaValue = string | number | readonly string[] | undefined;

export interface UseTextareaAutosizeParams {
  textareaRef: RefObject<HTMLTextAreaElement | null>;
  /**
   * The resolved autosize config (see `resolveTextareaAutosize`).
   */
  config: ResolvedTextareaAutosize;
  /**
   * Re-measures on external controlled value changes; user typing is
   * covered by the native `input` listener (both modes, IME included).
   */
  value: TextareaValue;
}

export interface UseTextareaClearParams {
  textareaRef: RefObject<HTMLTextAreaElement | null>;
  /**
   * The consumer's onChange — the only event notification path.
   */
  onChange: ChangeEventHandler<HTMLTextAreaElement> | undefined;
  /**
   * Runs after the clear commit so behaviors observing the DOM value
   * (autosize measurement, count display) can re-sync — the DOM is already
   * written.
   */
  onCleared?: () => void;
}

export interface UseTextareaCountParams {
  textareaRef: RefObject<HTMLTextAreaElement | null>;
  value: TextareaValue;
  /**
   * Controlled detection (React's convention: `value !== undefined`).
   */
  controlled: boolean;
  /**
   * Dormant unless `showCount` is on.
   */
  active: boolean;
}

export interface UseTextareaResizeParams {
  textareaRef: RefObject<HTMLTextAreaElement | null>;
  /**
   * Whether the footer handle is enabled (the autosize resolver's
   * `resizable` flag) — handlers no-op elsewhere, the button is not
   * rendered there anyway.
   */
  enabled: boolean;
}
